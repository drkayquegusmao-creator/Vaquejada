
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface MediaCreationViewProps {
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = 'CAMERA' | 'PREVIEW' | 'PUBLISH';
type Mode = 'FEED' | 'FOTO' | 'STORY';

const MediaCreationView: React.FC<MediaCreationViewProps> = ({ user, onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('CAMERA');
    const [mode, setMode] = useState<Mode>('FEED');
    const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob; url: string; type: 'image' | 'video' } | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form stats
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [eventId, setEventId] = useState('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (step === 'CAMERA') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step, mode]);

    const startCamera = async () => {
        try {
            setPermissionError(null);
            const constraints = {
                video: { facingMode: 'user' },
                audio: mode === 'STORY'
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setPermissionError('Não foi possível acessar a câmera. Por favor, verifique as permissões.');
        }
    };

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setCapturedMedia({ blob, url, type: 'image' });
                    setStep('PREVIEW');
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const type = file.type.startsWith('video') ? 'video' : 'image';
            const url = URL.createObjectURL(file);
            setCapturedMedia({ blob: file, url, type });
            setStep('PREVIEW');
        }
    };

    const handlePublish = async () => {
        if (!capturedMedia || !user) return;

        setIsUploading(true);
        try {
            const fileName = `${user.id}/${Date.now()}.${capturedMedia.type === 'image' ? 'jpg' : 'mp4'}`;
            const bucket = capturedMedia.type === 'image' ? 'posts_media' : 'stories_media';

            // 1. Upload to Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, capturedMedia.blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            // 2. Save to Database
            if (mode === 'STORY') {
                const { error: dbError } = await supabase
                    .from('stories')
                    .insert({
                        user_id: user.id,
                        media_url: publicUrl,
                        media_type: capturedMedia.type,
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    });
                if (dbError) throw dbError;
            } else {
                const { error: dbError } = await supabase
                    .from('posts')
                    .insert({
                        user_id: user.id,
                        media_url: publicUrl,
                        media_type: capturedMedia.type,
                        caption,
                        location,
                        event_id: eventId || null
                    });
                if (dbError) throw dbError;
            }

            onSuccess();
        } catch (err: any) {
            alert(`Erro ao publicar: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Render Screens
    const renderCamera = () => (
        <div className="absolute inset-0 bg-black flex flex-col z-[200]">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-6 z-10">
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                    <span className="material-icons">close</span>
                </button>
                <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white">
                    <span className="material-icons">flash_off</span>
                </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {permissionError ? (
                    <div className="p-8 text-center text-white space-y-6">
                        <span className="material-icons text-6xl opacity-20">videocam_off</span>
                        <p className="text-sm font-bold opacity-60">{permissionError}</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-black font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-xs"
                            >
                                Selecionar da Galeria
                            </button>
                            <button className="text-white/40 font-black uppercase text-[10px] tracking-widest pt-4">Abrir Configurações</button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-10 space-y-8 bg-gradient-to-t from-black to-transparent">
                <div className="flex justify-center gap-8 items-center">
                    <button
                        onClick={() => setMode('FEED')}
                        className={`text-xs font-black uppercase tracking-widest transition-all ${mode === 'FEED' ? 'text-[#ECA413] scale-110' : 'text-white/40'}`}
                    >
                        FEED
                    </button>
                    <button
                        onClick={() => setMode('FOTO')}
                        className={`text-xs font-black uppercase tracking-widest transition-all ${mode === 'FOTO' ? 'text-[#ECA413] scale-110' : 'text-white/40'}`}
                    >
                        FOTO
                    </button>
                    <button
                        onClick={() => setMode('STORY')}
                        className={`text-xs font-black uppercase tracking-widest transition-all ${mode === 'STORY' ? 'text-[#ECA413] scale-110' : 'text-white/40'}`}
                    >
                        STORY
                    </button>
                </div>

                <div className="flex justify-center items-center gap-12">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center text-white overflow-hidden"
                    >
                        <span className="material-icons opacity-40">photo_library</span>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                    </button>

                    <button
                        onClick={capturePhoto}
                        className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <div className="w-full h-full rounded-full bg-white"></div>
                    </button>

                    <button className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white">
                        <span className="material-icons opacity-40">flip_camera_ios</span>
                    </button>
                </div>

                <p className="text-[10px] text-center font-black text-white/40 uppercase tracking-widest">
                    {mode === 'STORY' ? 'Toque para gravar story' : 'Toque para capturar e postar'}
                </p>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="absolute inset-0 bg-black flex flex-col z-[200]">
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {capturedMedia?.type === 'video' ? (
                    <video src={capturedMedia.url} controls autoPlay loop className="w-full h-full object-cover" />
                ) : (
                    <img src={capturedMedia?.url} className="w-full h-full object-cover" alt="Captured" />
                )}
            </div>

            <div className="p-8 pb-12 bg-black flex gap-4">
                <button
                    onClick={() => { setCapturedMedia(null); setStep('CAMERA'); }}
                    className="flex-1 bg-white/10 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs border border-white/10"
                >
                    Refazer
                </button>
                <button
                    onClick={() => setStep('PUBLISH')}
                    className="flex-1 bg-[#ECA413] text-background-dark font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-[#ECA413]/20"
                >
                    Usar
                </button>
            </div>
        </div>
    );

    const renderPublish = () => (
        <div className="absolute inset-0 bg-background-dark flex flex-col z-[200]">
            {/* Header */}
            <header className="px-6 py-4 flex items-center gap-4 border-b border-white/5">
                <button onClick={() => setStep('PREVIEW')} className="material-icons text-white/60">arrow_back</button>
                <h2 className="text-white font-black uppercase text-sm italic tracking-tight">Finalizar Postagem</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                        {capturedMedia?.type === 'video' ? (
                            <video src={capturedMedia.url} className="w-full h-full object-cover" />
                        ) : (
                            <img src={capturedMedia?.url} className="w-full h-full object-cover" alt="Thumb" />
                        )}
                    </div>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Escreva uma legenda..."
                        className="flex-1 bg-transparent text-white text-sm outline-none resize-none pt-2 placeholder:text-white/20"
                    />
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-icons text-[#ECA413]">place</span>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Adicionar localização (opcional)"
                            className="bg-transparent flex-1 text-xs text-white outline-none placeholder:text-white/20"
                        />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <span className="material-icons text-[#ECA413]">event</span>
                        <input
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value)}
                            placeholder="Vincular a uma Vaquejada (ID)"
                            className="bg-transparent flex-1 text-xs text-white outline-none placeholder:text-white/20"
                        />
                    </div>
                </div>

                <div className="p-6 bg-[#ECA413]/5 border border-[#ECA413]/20 rounded-2xl">
                    <p className="text-[10px] font-black text-[#ECA413] uppercase tracking-widest mb-1 text-center">Configurações</p>
                    <p className="text-[9px] text-white/40 text-center uppercase tracking-tighter">Seu post será visível para toda a comunidade do +Vaquejada.</p>
                </div>
            </div>

            {/* Publish Button */}
            <div className="p-6 bg-background-dark border-t border-white/5">
                <button
                    onClick={handlePublish}
                    disabled={isUploading}
                    className="w-full bg-[#ECA413] text-background-dark font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-[#ECA413]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isUploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
                            <span>Publicando...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-icons">send</span>
                            <span>Publicar na Arena</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {step === 'CAMERA' && renderCamera()}
            {step === 'PREVIEW' && renderPreview()}
            {step === 'PUBLISH' && renderPublish()}
        </>
    );
};

export default MediaCreationView;
