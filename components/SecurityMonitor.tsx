
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, Activity, RefreshCw, Power, AlertTriangle, Volume2, VolumeX, Maximize2, Minimize2, Monitor, Plus, X as XIcon } from 'lucide-react';

interface ActiveStream {
    id: string; // unique internal id
    stream: MediaStream;
    type: 'video' | 'audio';
    label: string;
    origin: 'physical' | 'custom';
    deviceId?: string; // for physical devices
}

interface CustomSource {
    id: string;
    stream: MediaStream;
    type: 'video' | 'audio';
    label: string;
}

export const SecurityMonitor: React.FC = () => {
    // Physical Devices (Webcams/Mics)
    const [physicalDevices, setPhysicalDevices] = useState<MediaDeviceInfo[]>([]);
    
    // Custom Sources (Screens - "Available" but not necessarily "Active")
    const [customSources, setCustomSources] = useState<CustomSource[]>([]);

    // Active Grid (What is actually showing)
    const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([]);
    
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    
    // We track "checked" state by IDs. 
    // For physical: ID is deviceId. For custom: ID is internal GUID.
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        refreshDevices();
        return () => {
            // Cleanup all streams on unmount
            activeStreams.forEach(s => s.stream.getTracks().forEach(t => t.stop()));
            customSources.forEach(s => s.stream.getTracks().forEach(t => t.stop()));
        };
    }, []);

    const refreshDevices = async () => {
        try {
            if (!permissionGranted) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(t => t.stop());
                setPermissionGranted(true);
            }
            const devs = await navigator.mediaDevices.enumerateDevices();
            setPhysicalDevices(devs);
            setError(null);
        } catch (e: any) {
            console.error(e);
            setError("Access denied. Please allow Camera/Mic permissions.");
        }
    };

    // --- TOGGLE LOGIC ---

    const togglePhysicalDevice = async (device: MediaDeviceInfo) => {
        const isSelected = selectedIds.has(device.deviceId);
        
        if (isSelected) {
            // Uncheck: Remove from active streams and set
            stopActiveStream(device.deviceId);
            const next = new Set(selectedIds);
            next.delete(device.deviceId);
            setSelectedIds(next);
        } else {
            // Check: Start stream
            const type = device.kind === 'videoinput' ? 'video' : 'audio';
            const constraints = type === 'video' 
                ? { video: { deviceId: { exact: device.deviceId } } } 
                : { audio: { deviceId: { exact: device.deviceId }, echoCancellation: true } };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                addActiveStream({
                    id: device.deviceId,
                    stream,
                    type,
                    label: device.label || `${type} ${device.deviceId.slice(0,5)}`,
                    origin: 'physical',
                    deviceId: device.deviceId
                });
                
                const next = new Set(selectedIds);
                next.add(device.deviceId);
                setSelectedIds(next);
            } catch (e: any) {
                setError(`Failed to start ${device.label}: ${e.message}`);
            }
        }
    };

    const toggleCustomSource = (source: CustomSource) => {
        const isSelected = selectedIds.has(source.id);

        if (isSelected) {
            // Uncheck: Remove from active streams only (Keep source alive)
            stopActiveStream(source.id); // This just filters it out of the UI list
            const next = new Set(selectedIds);
            next.delete(source.id);
            setSelectedIds(next);
        } else {
            // Check: Add to active streams using existing stream
            // Check if stream is still active
            if (source.stream.active) {
                addActiveStream({
                    id: source.id,
                    stream: source.stream, // Reuse existing stream
                    type: source.type,
                    label: source.label,
                    origin: 'custom'
                });
                const next = new Set(selectedIds);
                next.add(source.id);
                setSelectedIds(next);
            } else {
                // If stream died (e.g. user stopped sharing externally), remove it entirely
                removeCustomSource(source.id);
            }
        }
    };

    // --- HELPER FUNCTIONS ---

    const addActiveStream = (stream: ActiveStream) => {
        setActiveStreams(prev => [...prev, stream]);
    };

    const stopActiveStream = (id: string) => {
        setActiveStreams(prev => {
            const target = prev.find(s => s.id === id);
            // Only stop tracks if it's a PHYSICAL device. 
            // Custom sources keep tracks alive so they can be re-checked.
            if (target && target.origin === 'physical') {
                target.stream.getTracks().forEach(t => t.stop());
            }
            return prev.filter(s => s.id !== id);
        });
    };

    const removeCustomSource = (id: string) => {
        // 1. Remove from Active Streams (stop logic handled inside, but since it's custom, we must manually stop here)
        setActiveStreams(prev => prev.filter(s => s.id !== id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

        // 2. Remove from Custom Sources list and kill tracks
        setCustomSources(prev => {
            const target = prev.find(s => s.id === id);
            if (target) {
                target.stream.getTracks().forEach(t => t.stop());
            }
            return prev.filter(s => s.id !== id);
        });
    };

    // --- ADD SOURCES LOGIC ---

    const addScreenSource = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];
            const baseId = `custom-${Date.now()}`;
            const label = videoTrack?.label || "Window/Screen";

            // If user clicks "Stop Sharing" on browser UI, remove all related custom sources
            const handleEnded = () => {
                // Find all sources related to this stream and remove them
                // We can't easily track them back unless we store the stream reference or similar ID
                // Simple approach: Iterate customSources and check if stream.active is false
                setCustomSources(prev => {
                    const toRemove = prev.filter(s => s.stream.id === stream.id && !s.stream.active);
                    toRemove.forEach(s => removeCustomSource(s.id));
                    return prev.filter(s => s.stream.active); // Keep active only
                });
            };

            if (videoTrack) {
                videoTrack.onended = handleEnded;
                const vId = `${baseId}-vid`;
                const vSource: CustomSource = {
                    id: vId,
                    stream: new MediaStream([videoTrack]), // Wrap in new stream to separate control
                    type: 'video',
                    label: `WIN: ${label}`
                };
                setCustomSources(prev => [...prev, vSource]);
                // Auto-check
                toggleCustomSource(vSource);
            }

            if (audioTrack) {
                // Audio track might end if video ends
                // We create a separate source entry for audio
                const aId = `${baseId}-aud`;
                const aSource: CustomSource = {
                    id: aId,
                    stream: new MediaStream([audioTrack]),
                    type: 'audio',
                    label: `WIN: ${label} (Audio)`
                };
                setCustomSources(prev => [...prev, aSource]);
                // Auto-check
                toggleCustomSource(aSource);
            }

        } catch (e: any) {
            if (e.name !== 'NotAllowedError') setError(`Add Source Failed: ${e.message}`);
        }
    };

    // Derived Lists for UI
    const videoInputs = [
        ...physicalDevices.filter(d => d.kind === 'videoinput').map(d => ({ type: 'physical' as const, data: d })),
        ...customSources.filter(s => s.type === 'video').map(s => ({ type: 'custom' as const, data: s }))
    ];

    const audioInputs = [
        ...physicalDevices.filter(d => d.kind === 'audioinput').map(d => ({ type: 'physical' as const, data: d })),
        ...customSources.filter(s => s.type === 'audio').map(s => ({ type: 'custom' as const, data: s }))
    ];

    const activeVideos = activeStreams.filter(s => s.type === 'video');
    const activeAudios = activeStreams.filter(s => s.type === 'audio');

    return (
        <div className="space-y-6 pb-24">
            {/* Header / Control Panel */}
            <div className="bg-white border-4 border-black p-4 pixel-shadow">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b-4 border-black pb-2 gap-4">
                    <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
                        <Activity size={28} className="text-retro-gold" /> Security Hub
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-end">
                         <button 
                            onClick={addScreenSource} 
                            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 border-2 border-black font-bold pixel-shadow active:translate-y-1 active:shadow-none transition-all"
                        >
                            <Monitor size={16} /> <Plus size={12} /> WIN/SCR
                        </button>
                        <button 
                            onClick={refreshDevices} 
                            className="flex items-center gap-2 text-sm bg-retro-gold text-black px-4 py-2 hover:bg-yellow-400 border-2 border-black font-bold pixel-shadow active:translate-y-1 active:shadow-none transition-all"
                        >
                            <RefreshCw size={16} /> RESCAN
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-black text-red-800 p-2 mb-4 text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={18} /> SYSTEM ERROR: {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video Inputs List */}
                    <div className="bg-gray-50 border-2 border-black p-3">
                        <h3 className="text-sm font-bold uppercase mb-2 flex items-center gap-2 text-gray-700 border-b-2 border-gray-200 pb-1">
                            <Camera size={16} /> Video Inputs
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {videoInputs.length === 0 && <div className="text-gray-500 text-sm italic p-2">No Video Sources.</div>}
                            {videoInputs.map((item, idx) => {
                                const isPhysical = item.type === 'physical';
                                const id = isPhysical ? (item.data as MediaDeviceInfo).deviceId : (item.data as CustomSource).id;
                                const label = isPhysical ? (item.data as MediaDeviceInfo).label || `Cam ${idx+1}` : (item.data as CustomSource).label;
                                const isChecked = selectedIds.has(id);

                                return (
                                    <div key={id} className="flex items-center gap-2 hover:bg-yellow-100 p-2 rounded group border border-transparent hover:border-black/10 transition-colors">
                                        <label className="flex-1 flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                onChange={() => isPhysical ? togglePhysicalDevice(item.data as MediaDeviceInfo) : toggleCustomSource(item.data as CustomSource)}
                                                className="accent-black h-5 w-5"
                                            />
                                            <span className="text-sm truncate text-black font-bold">{label}</span>
                                            {isChecked && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 ml-auto border border-black rounded-sm">LIVE</span>}
                                        </label>
                                        {!isPhysical && (
                                            <button 
                                                onClick={() => removeCustomSource(id)}
                                                className="text-gray-400 hover:text-red-600 p-1"
                                                title="Forget Source"
                                            >
                                                <XIcon size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Audio Inputs List */}
                    <div className="bg-gray-50 border-2 border-black p-3">
                        <h3 className="text-sm font-bold uppercase mb-2 flex items-center gap-2 text-gray-700 border-b-2 border-gray-200 pb-1">
                            <Mic size={16} /> Audio Inputs
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {audioInputs.length === 0 && <div className="text-gray-500 text-sm italic p-2">No Audio Sources.</div>}
                            {audioInputs.map((item, idx) => {
                                const isPhysical = item.type === 'physical';
                                const id = isPhysical ? (item.data as MediaDeviceInfo).deviceId : (item.data as CustomSource).id;
                                const label = isPhysical ? (item.data as MediaDeviceInfo).label || `Mic ${idx+1}` : (item.data as CustomSource).label;
                                const isChecked = selectedIds.has(id);

                                return (
                                    <div key={id} className="flex items-center gap-2 hover:bg-yellow-100 p-2 rounded group border border-transparent hover:border-black/10 transition-colors">
                                        <label className="flex-1 flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                onChange={() => isPhysical ? togglePhysicalDevice(item.data as MediaDeviceInfo) : toggleCustomSource(item.data as CustomSource)}
                                                className="accent-black h-5 w-5"
                                            />
                                            <span className="text-sm truncate text-black font-bold">{label}</span>
                                            {isChecked && <Activity size={16} className="text-green-600 ml-auto" />}
                                        </label>
                                        {!isPhysical && (
                                            <button 
                                                onClick={() => removeCustomSource(id)}
                                                className="text-gray-400 hover:text-red-600 p-1"
                                                title="Forget Source"
                                            >
                                                <XIcon size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStreams.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-200 border-4 border-black h-64 flex flex-col items-center justify-center text-gray-500 font-bold pixel-shadow">
                        <Power size={64} className="mb-4 opacity-50" />
                        <span className="animate-pulse text-lg">AWAITING SIGNAL...</span>
                    </div>
                )}
                {activeVideos.map(feed => (
                   <VideoFeed key={feed.id} stream={feed.stream} label={feed.label} />
                ))}
                {activeAudios.map(feed => (
                    <AudioVisualizer key={feed.id} stream={feed.stream} label={feed.label} />
                ))}
            </div>
        </div>
    );
};

// Sub-component for individual video feed
const VideoFeed: React.FC<{ stream: MediaStream, label: string }> = ({ stream, label }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div 
            className={`
                bg-black border-4 border-black pixel-shadow group transition-all duration-300 flex flex-col
                ${isZoomed ? 'fixed inset-0 z-50 bg-black/95 h-screen w-screen' : 'relative aspect-video'}
            `}
        >
            <div className={`
                bg-white text-black p-2 flex justify-between items-center border-b-2 border-black shrink-0
            `}>
                <span className="text-xs font-bold uppercase truncate max-w-[80%] px-1 flex items-center gap-2">
                    <Camera size={14} /> {label}
                </span>
                <button 
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="bg-gray-200 text-black p-1.5 hover:bg-white border-2 border-black rounded-sm"
                    title={isZoomed ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>
            <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className={`object-contain ${isZoomed ? 'h-full w-full' : 'w-full h-full'}`}
                />
            </div>
        </div>
    );
};

// Sub-component for audio visualization
const AudioVisualizer: React.FC<{ stream: MediaStream, label: string }> = ({ stream, label }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const animationRef = useRef<number>(0);
    const [isAudible, setIsAudible] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        
        let source;
        try { source = audioCtx.createMediaStreamSource(stream); } catch (e) { return; }

        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 64;
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0; 
        
        source.connect(analyzer);
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNodeRef.current = gainNode;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);
            if (ctx) {
                // Keep background dark for the visualization itself for contrast
                ctx.fillStyle = '#111111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * canvas.height;
                    // Retro Green
                    ctx.fillStyle = barHeight > canvas.height * 0.8 ? '#f87171' : `#4ade80`;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            }
        };
        draw();
        return () => {
            cancelAnimationFrame(animationRef.current);
            if (audioCtx.state !== 'closed') audioCtx.close();
        };
    }, [stream]);

    useEffect(() => {
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(isAudible ? 1 : 0, audioCtxRef.current.currentTime, 0.1);
        }
    }, [isAudible]);

    return (
        <div className="relative bg-black border-4 border-black pixel-shadow h-32 flex flex-col group">
            <div className="bg-white p-2 flex justify-between items-center border-b-2 border-black">
                <span className="text-xs text-black font-bold uppercase flex items-center gap-2 truncate max-w-[70%]">
                    {label.includes('WIN:') ? <Monitor size={14} /> : <Mic size={14} />} {label}
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsAudible(!isAudible)}
                        className={`p-1.5 rounded ${isAudible ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-black'}`}
                        title={isAudible ? "Mute" : "Listen"}
                    >
                        {isAudible ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <Activity size={16} className="text-green-500 animate-pulse" />
                </div>
            </div>
            <canvas ref={canvasRef} width={300} height={100} className="w-full h-full" />
            {isAudible && (
                 <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold animate-pulse pointer-events-none border border-black">LISTENING</div>
            )}
        </div>
    );
};
