import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Share2, 
  Copy, 
  Check, 
  Flame, 
  Trophy, 
  Dumbbell, 
  Footprints, 
  Zap, 
  Clock, 
  Sparkles, 
  Plus, 
  X, 
  Layers, 
  ArrowRight, 
  Shield, 
  CheckCircle, 
  RotateCcw,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Send,
  Maximize2,
  Trash2,
  QrCode,
  Flag,
  MapPin,
  Calendar,
  Heart,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { 
  Squad, 
  SquadMember, 
  SquadCheckin, 
  SquadPost,
  SquadComment,
  SquadMeetup,
  SquadChallenge,
  SquadDiscipline, 
  SharedRoutinePayload,
  DEFAULT_COMMUNITY_SQUADS, 
  DEFAULT_SQUAD_POSTS,
  generateSquadCode, 
  validateSquadCode, 
  hasUserCheckedInToday, 
  calculateStreak,
  fetchSquadByCodeCloud,
  createSquadCloud,
  joinSquadCloud,
  fetchSquadMembersCloud,
  fetchSquadCheckinsCloud,
  postSquadCheckinCloud,
  shareRoutineToSquadCloud,
  fetchSquadPostsCloud,
  createSquadPostCloud,
  reactToSquadPostCloud
} from '../lib/squads';
import { compressImageToWebP, uploadSquadImage, CompressedImageResult } from '../lib/imageCompression';
import { useAuth } from '../lib/auth';
import { playBeepSound } from '../lib/sound';
import SoftWallModal, { SoftWallTrigger } from './SoftWallModal';
import { buildSquadInviteMessage, buildStreakShareMessage, shareContent, generateWhatsAppLink } from '../lib/share';

interface SquadsModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

export default function SquadsModule({ nickname, onNotification }: SquadsModuleProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [softWallTrigger, setSoftWallTrigger] = useState<SoftWallTrigger | null>(null);

  // Lista de combos guardados localmente
  const [squads, setSquads] = useState<Squad[]>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squads_v1`);
      return saved ? JSON.parse(saved) : DEFAULT_COMMUNITY_SQUADS;
    } catch {
      return DEFAULT_COMMUNITY_SQUADS;
    }
  });

  const [activeSquadId, setActiveSquadId] = useState<string>(() => {
    return squads[0]?.id || 'squad_hyrox_titans';
  });

  // Pestañas: Muro · Rutinas · Equipo · Retos
  const [activeSubTab, setActiveSubTab] = useState<'wall' | 'routine' | 'roster' | 'challenges'>('wall');

  // Miembros de los combos
  const [members, setMembers] = useState<Record<string, SquadMember[]>>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squad_members_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}

    return {
      squad_hyrox_titans: [
        { id: 'm1', squadId: 'squad_hyrox_titans', nickname: 'Coach_Marcos', role: 'leader', joinedAt: Date.now() - 86400000 * 14, lastCheckinAt: Date.now(), lastActivityText: 'Simulacro Hyrox: Sled Push + 1km', streakDays: 12, hasCheckedInToday: true },
        { id: 'm2', squadId: 'squad_hyrox_titans', nickname, role: 'member', joinedAt: Date.now() - 86400000 * 3, lastCheckinAt: Date.now() - 86400000, lastActivityText: 'Agarre OCR: 4x60s Cuelgues', streakDays: 3, hasCheckedInToday: false },
        { id: 'm3', squadId: 'squad_hyrox_titans', nickname: 'Lucas_OCR', role: 'member', joinedAt: Date.now() - 86400000 * 10, lastCheckinAt: Date.now(), lastActivityText: 'Compromised Running 5K', streakDays: 7, hasCheckedInToday: true },
        { id: 'm4', squadId: 'squad_hyrox_titans', nickname: 'Andrea_Fit', role: 'member', joinedAt: Date.now() - 86400000 * 8, lastCheckinAt: Date.now() - 86400000 * 2, lastActivityText: 'Burpees + Farmer Walks', streakDays: 1, hasCheckedInToday: false }
      ],
      squad_polar_runners: [
        { id: 'm5', squadId: 'squad_polar_runners', nickname: 'Elena_Run', role: 'leader', joinedAt: Date.now() - 86400000 * 20, lastCheckinAt: Date.now(), lastActivityText: 'Rodaje Z2 12 km @ 5:30/km', streakDays: 18, hasCheckedInToday: true },
        { id: 'm6', squadId: 'squad_polar_runners', nickname, role: 'member', joinedAt: Date.now() - 86400000 * 2, lastCheckinAt: undefined, streakDays: 0, hasCheckedInToday: false },
        { id: 'm7', squadId: 'squad_polar_runners', nickname: 'Martin_Marathon', role: 'member', joinedAt: Date.now() - 86400000 * 15, lastCheckinAt: Date.now(), lastActivityText: 'Series 6x1000m @ 4:10/km', streakDays: 9, hasCheckedInToday: true }
      ],
      squad_hypertrophy_brotherhood: [
        { id: 'm8', squadId: 'squad_hypertrophy_brotherhood', nickname: 'Carlos_Lift', role: 'leader', joinedAt: Date.now() - 86400000 * 30, lastCheckinAt: Date.now(), lastActivityText: 'Torso Hipertrofia A (RIR 1)', streakDays: 15, hasCheckedInToday: true },
        { id: 'm9', squadId: 'squad_hypertrophy_brotherhood', nickname, role: 'member', joinedAt: Date.now() - 86400000 * 1, lastCheckinAt: undefined, streakDays: 0, hasCheckedInToday: false }
      ]
    };
  });

  // Check-ins
  const [checkins, setCheckins] = useState<Record<string, SquadCheckin[]>>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squad_checkins_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}

    return {
      squad_hyrox_titans: [
        { id: 'c1', squadId: 'squad_hyrox_titans', nickname: 'Coach_Marcos', activityType: 'hyrox_ocr', activityTitle: 'Simulacro Hyrox: Sled Push + 1km', details: 'Ronda de 4 estaciones completadas en 28 min.', createdAt: Date.now() - 3600000 * 2 },
        { id: 'c2', squadId: 'squad_hyrox_titans', nickname: 'Lucas_OCR', activityType: 'running', activityTitle: 'Compromised Running 5K', details: 'Piernas quemadas tras zancadas lastradas.', createdAt: Date.now() - 3600000 * 5 }
      ],
      squad_polar_runners: [
        { id: 'c3', squadId: 'squad_polar_runners', nickname: 'Elena_Run', activityType: 'running', activityTitle: 'Rodaje Z2 12 km @ 5:30/km', details: 'Pulsaciones estables en 138 ppm.', createdAt: Date.now() - 3600000 * 3 }
      ],
      squad_hypertrophy_brotherhood: [
        { id: 'c4', squadId: 'squad_hypertrophy_brotherhood', nickname: 'Carlos_Lift', activityType: 'strength', activityTitle: 'Torso Hipertrofia A', details: 'Superado récord de banca con 85kg x 7 reps.', createdAt: Date.now() - 3600000 * 4 }
      ]
    };
  });

  // Publicaciones del Muro
  const [posts, setPosts] = useState<Record<string, SquadPost[]>>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squad_posts_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SQUAD_POSTS;
  });

  // Quedadas del combo (Meetups)
  const [meetups, setMeetups] = useState<Record<string, SquadMeetup[]>>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squad_meetups_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      squad_hyrox_titans: [
        {
          id: 'meet_1',
          squadId: 'squad_hyrox_titans',
          creatorNickname: 'Coach_Marcos',
          title: 'Simulacro Hyrox Completo al Aire Libre',
          date: 'Sábado 18 de Octubre',
          time: '08:00 AM',
          location: 'Parque El Virrey (Zona de barras)',
          attendees: ['Coach_Marcos', 'Lucas_OCR', nickname],
          declined: ['Andrea_Fit'],
          createdAt: Date.now() - 86400000 * 2
        }
      ],
      squad_polar_runners: [
        {
          id: 'meet_2',
          squadId: 'squad_polar_runners',
          creatorNickname: 'Elena_Run',
          title: 'Tirada Larga Dominical 16K en Z2',
          date: 'Domingo 19 de Octubre',
          time: '06:30 AM',
          location: 'Entrada Principal Parque Simón Bolívar',
          attendees: ['Elena_Run', 'Martin_Marathon'],
          declined: [],
          createdAt: Date.now() - 86400000 * 1
        }
      ]
    };
  });

  // Creador de posts
  const [postContent, setPostContent] = useState<string>('');
  const [postBadge, setPostBadge] = useState<string>('Entrenamiento general');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Comentarios desplegados por post ID
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Modales
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showShareCardModal, setShowShareCardModal] = useState<boolean>(false);
  const [showNewMeetupModal, setShowNewMeetupModal] = useState<boolean>(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Formulario de nueva quedada
  const [newMeetupTitle, setNewMeetupTitle] = useState('');
  const [newMeetupDate, setNewMeetupDate] = useState('');
  const [newMeetupTime, setNewMeetupTime] = useState('');
  const [newMeetupLocation, setNewMeetupLocation] = useState('');

  // Formulario de nuevo combo
  const [newSquadName, setNewSquadName] = useState<string>('');
  const [newSquadMotto, setNewSquadMotto] = useState<string>('');
  const [newSquadDiscipline, setNewSquadDiscipline] = useState<SquadDiscipline>('hybrid');
  const [includeMyRoutine, setIncludeMyRoutine] = useState<boolean>(true);

  // Formulario de unirse
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Formulario de check-in
  const [checkinType, setCheckinType] = useState<SquadCheckin['activityType']>('strength');
  const [checkinTitle, setCheckinTitle] = useState<string>('');
  const [checkinDetails, setCheckinDetails] = useState<string>('');

  // Persistir cambios locales
  useEffect(() => {
    try {
      localStorage.setItem(`fit_gen_${nickname}_squads_v1`, JSON.stringify(squads));
    } catch {}
  }, [squads, nickname]);

  useEffect(() => {
    try {
      localStorage.setItem(`fit_gen_${nickname}_squad_members_v1`, JSON.stringify(members));
    } catch {}
  }, [members, nickname]);

  useEffect(() => {
    try {
      localStorage.setItem(`fit_gen_${nickname}_squad_checkins_v1`, JSON.stringify(checkins));
    } catch {}
  }, [checkins, nickname]);

  useEffect(() => {
    try {
      localStorage.setItem(`fit_gen_${nickname}_squad_posts_v1`, JSON.stringify(posts));
    } catch {}
  }, [posts, nickname]);

  useEffect(() => {
    try {
      localStorage.setItem(`fit_gen_${nickname}_squad_meetups_v1`, JSON.stringify(meetups));
    } catch {}
  }, [meetups, nickname]);

  // Combo actualmente seleccionado
  const currentSquad = useMemo(() => {
    return squads.find((s) => s.id === activeSquadId) || squads[0] || null;
  }, [squads, activeSquadId]);

  const currentMembers = useMemo(() => {
    if (!currentSquad) return [];
    return members[currentSquad.id] || [];
  }, [members, currentSquad]);

  const currentCheckins = useMemo(() => {
    if (!currentSquad) return [];
    return checkins[currentSquad.id] || [];
  }, [checkins, currentSquad]);

  const currentPosts = useMemo(() => {
    if (!currentSquad) return [];
    return posts[currentSquad.id] || [];
  }, [posts, currentSquad]);

  const currentMeetups = useMemo(() => {
    if (!currentSquad) return [];
    return meetups[currentSquad.id] || [];
  }, [meetups, currentSquad]);

  // Información del usuario actual en el combo
  const userMemberInfo = useMemo(() => {
    return currentMembers.find((m) => m.nickname.toLowerCase() === nickname.toLowerCase());
  }, [currentMembers, nickname]);

  const isUserCaptain = useMemo(() => {
    if (!currentSquad) return false;
    return currentSquad.creatorNickname.toLowerCase() === nickname.toLowerCase() || 
           userMemberInfo?.role === 'leader';
  }, [currentSquad, nickname, userMemberInfo]);

  const userHasCheckedInToday = useMemo(() => {
    return hasUserCheckedInToday(userMemberInfo?.lastCheckinAt);
  }, [userMemberInfo]);

  // Quiénes entrenaron hoy en este combo
  const whoTrainedToday = useMemo(() => {
    return currentMembers.filter((m) => hasUserCheckedInToday(m.lastCheckinAt));
  }, [currentMembers]);

  // Color según disciplina del combo o actividad
  const getDisciplineColor = (disc?: SquadDiscipline | string) => {
    switch (disc) {
      case 'strength':
        return '#1FD08A';
      case 'running':
        return '#5B8DEF';
      case 'hyrox_ocr':
        return '#C084FC';
      default:
        return '#FB923C';
    }
  };

  const getDisciplineName = (disc?: SquadDiscipline | string) => {
    switch (disc) {
      case 'strength':
        return 'Musculación';
      case 'running':
        return 'Running';
      case 'hyrox_ocr':
        return 'Hyrox / OCR';
      default:
        return 'Híbrido';
    }
  };

  // Copiar código al portapapeles
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    playBeepSound();
    if (onNotification) onNotification(`¡Código ${code} copiado! Compártelo con tus amigos.`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // WhatsApp share
  const handleShareSquadWhatsApp = async () => {
    if (!currentSquad) return;
    playBeepSound();
    const text = buildSquadInviteMessage(currentSquad.name, currentSquad.code);
    const link = generateWhatsAppLink(text);
    window.open(link, '_blank');
    if (onNotification) onNotification('Abriendo WhatsApp con tu código de invitación...');
  };

  // Selección y compresión WebP
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setSelectedFile(file);

    try {
      const result = await compressImageToWebP(file, 1080, 0.8);
      setCompressedImage(result);
      playBeepSound();
      if (onNotification) {
        onNotification(`Foto optimizada en WebP: de ${result.originalSizeKB} KB a ${result.compressedSizeKB} KB.`);
      }
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('No se pudo procesar la foto.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    setCompressedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Publicar post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSquad) return;
    const cleanText = postContent.trim();
    if (!cleanText && !compressedImage) return;

    setIsPublishing(true);
    let finalImageUrl: string | undefined = undefined;

    if (selectedFile) {
      try {
        const uploadResult = await uploadSquadImage(selectedFile, currentSquad.id, user?.id);
        finalImageUrl = uploadResult.url;
      } catch (err) {
        finalImageUrl = compressedImage?.dataUrl;
      }
    }

    const newPost: SquadPost = {
      id: `post_${Date.now()}`,
      squadId: currentSquad.id,
      userId: user?.id,
      nickname,
      content: cleanText || '¡Sesión de entrenamiento completada hoy con el equipo! 🔥',
      imageUrl: finalImageUrl,
      activityBadge: postBadge,
      discipline: currentSquad.discipline,
      reactions: { fire: 1, fist: 0, muscle: 0 },
      comments: [],
      createdAt: Date.now()
    };

    setPosts((prev) => ({
      ...prev,
      [currentSquad.id]: [newPost, ...(prev[currentSquad.id] || [])]
    }));

    if (user) {
      await createSquadPostCloud(
        currentSquad.id,
        user.id,
        nickname,
        newPost.content,
        finalImageUrl,
        postBadge
      );
    }

    setPostContent('');
    handleRemoveSelectedImage();
    setIsPublishing(false);
    playBeepSound();
    if (onNotification) onNotification('¡Publicación compartida con tu combo!');
  };

  // Reacciones
  const handleReaction = async (postId: string, type: 'fire' | 'fist' | 'muscle') => {
    if (!currentSquad) return;
    playBeepSound();
    setPosts((prev) => {
      const currentList = prev[currentSquad.id] || [];
      const updated = currentList.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            reactions: {
              ...p.reactions,
              [type]: (p.reactions[type] || 0) + 1
            }
          };
        }
        return p;
      });
      return { ...prev, [currentSquad.id]: updated };
    });
  };

  // Comentarios en hilo corto
  const handleAddComment = (postId: string) => {
    if (!currentSquad) return;
    const commentText = (commentInputs[postId] || '').trim();
    if (!commentText) return;

    const newComment: SquadComment = {
      id: `comment_${Date.now()}`,
      nickname,
      content: commentText,
      createdAt: Date.now()
    };

    setPosts((prev) => {
      const currentList = prev[currentSquad.id] || [];
      const updated = currentList.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), newComment]
          };
        }
        return p;
      });
      return { ...prev, [currentSquad.id]: updated };
    });

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    playBeepSound();
    if (onNotification) onNotification('Comentario añadido');
  };

  // Moderación: Borrar post (Capitán)
  const handleDeletePost = (postId: string) => {
    if (!currentSquad) return;
    if (window.confirm('¿Deseas eliminar esta publicación del muro?')) {
      setPosts((prev) => ({
        ...prev,
        [currentSquad.id]: (prev[currentSquad.id] || []).filter((p) => p.id !== postId)
      }));
      if (onNotification) onNotification('Publicación eliminada por moderación.');
    }
  };

  // Moderación: Reportar post (Miembro)
  const handleReportPost = (postId: string) => {
    alert('Gracias por tu reporte. La publicación ha sido enviada al capitán para su revisión.');
    if (onNotification) onNotification('Publicación reportada.');
  };

  // Moderación: Expulsar miembro (Capitán)
  const handleRemoveMember = (memberNickname: string) => {
    if (!currentSquad) return;
    if (window.confirm(`¿Deseas expulsar a ${memberNickname} del combo?`)) {
      setMembers((prev) => ({
        ...prev,
        [currentSquad.id]: (prev[currentSquad.id] || []).filter((m) => m.nickname !== memberNickname)
      }));
      if (onNotification) onNotification(`${memberNickname} fue removido del combo.`);
    }
  };

  // Registrar check-in diario
  const handleRecordCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSquad) return;
    const title = checkinTitle.trim() || 'Entrenamiento diario';

    const now = Date.now();
    const newCheckin: SquadCheckin = {
      id: `checkin_${now}`,
      squadId: currentSquad.id,
      nickname,
      activityType: checkinType,
      activityTitle: title,
      details: checkinDetails.trim() || undefined,
      createdAt: now
    };

    setCheckins((prev) => ({
      ...prev,
      [currentSquad.id]: [newCheckin, ...(prev[currentSquad.id] || [])]
    }));

    // Actualizar racha y estado del miembro
    setMembers((prev) => {
      const list = prev[currentSquad.id] || [];
      const updated = list.map((m) => {
        if (m.nickname.toLowerCase() === nickname.toLowerCase()) {
          const newStreak = calculateStreak(m.streakDays, m.lastCheckinAt);
          return {
            ...m,
            streakDays: newStreak,
            lastCheckinAt: now,
            lastActivityText: title,
            hasCheckedInToday: true
          };
        }
        return m;
      });
      return { ...prev, [currentSquad.id]: updated };
    });

    setShowCheckinModal(false);
    playBeepSound();
    if (onNotification) onNotification(`¡Check-in registrado! Racha activa en ${currentSquad.name} 🔥`);

    // Crear un post automático en el muro para celebrar
    const autoPost: SquadPost = {
      id: `post_auto_${now}`,
      squadId: currentSquad.id,
      nickname,
      content: `¡Hice mi check-in de hoy: "${title}"! 💪`,
      activityBadge: title,
      discipline: checkinType === 'running' ? 'running' : checkinType === 'hyrox_ocr' ? 'hyrox_ocr' : 'strength',
      reactions: { fire: 1, fist: 0, muscle: 0 },
      comments: [],
      createdAt: now
    };

    setPosts((prev) => ({
      ...prev,
      [currentSquad.id]: [autoPost, ...(prev[currentSquad.id] || [])]
    }));
  };

  // Crear Quedada
  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSquad) return;
    if (!newMeetupTitle.trim() || !newMeetupDate.trim() || !newMeetupLocation.trim()) return;

    const newMeet: SquadMeetup = {
      id: `meet_${Date.now()}`,
      squadId: currentSquad.id,
      creatorNickname: nickname,
      title: newMeetupTitle.trim(),
      date: newMeetupDate.trim(),
      time: newMeetupTime.trim() || '08:00 AM',
      location: newMeetupLocation.trim(),
      attendees: [nickname],
      declined: [],
      createdAt: Date.now()
    };

    setMeetups((prev) => ({
      ...prev,
      [currentSquad.id]: [newMeet, ...(prev[currentSquad.id] || [])]
    }));

    setShowNewMeetupModal(false);
    setNewMeetupTitle('');
    setNewMeetupDate('');
    setNewMeetupTime('');
    setNewMeetupLocation('');
    playBeepSound();
    if (onNotification) onNotification('¡Quedada propuesta para todo el equipo!');
  };

  // Responder a Quedada ("Voy" / "No puedo")
  const handleRespondMeetup = (meetupId: string, going: boolean) => {
    if (!currentSquad) return;
    playBeepSound();
    setMeetups((prev) => {
      const list = prev[currentSquad.id] || [];
      const updated = list.map((m) => {
        if (m.id === meetupId) {
          const attendees = going
            ? Array.from(new Set([...m.attendees, nickname]))
            : m.attendees.filter((n) => n !== nickname);
          const declined = !going
            ? Array.from(new Set([...m.declined, nickname]))
            : m.declined.filter((n) => n !== nickname);
          return { ...m, attendees, declined };
        }
        return m;
      });
      return { ...prev, [currentSquad.id]: updated };
    });
    if (onNotification) onNotification(going ? '¡Confirmaste tu asistencia! 🏃' : 'Respuesta registrada.');
  };

  // Copiar rutina compartida al plan semanal adaptada
  const handleCopyRoutineToWeekly = () => {
    if (!currentSquad?.sharedRoutine) {
      alert('Este combo no tiene una rutina compartida activa.');
      return;
    }
    const routine = currentSquad.sharedRoutine;
    playBeepSound();
    if (window.confirm(`¿Deseas clonar la rutina "${routine.title}" y adaptarla a tu plan semanal?`)) {
      if (onNotification) {
        onNotification(`¡Rutina "${routine.title}" clonada y adaptada a tu nivel con éxito! 💪`);
      }
    }
  };

  // Unirse a un combo con código
  const handleJoinSquadByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!validateSquadCode(cleanCode)) {
      setJoinError('El código debe tener 6 caracteres alfanuméricos (ej. HYR902).');
      return;
    }

    setJoinError(null);
    let found = squads.find((s) => s.code === cleanCode);

    if (!found) {
      // Buscar en los predeterminados
      found = DEFAULT_COMMUNITY_SQUADS.find((s) => s.code === cleanCode);
      if (found) {
        setSquads((prev) => [...prev, found!]);
      }
    }

    if (found) {
      setActiveSquadId(found.id);
      setShowJoinModal(false);
      setJoinCodeInput('');
      playBeepSound();
      if (onNotification) onNotification(`¡Te has unido exitosamente al combo "${found.name}"! 🔥`);
    } else {
      setJoinError('No se encontró ningún combo con ese código. Verifica las letras y números.');
    }
  };

  // Crear nuevo combo
  const handleCreateNewSquad = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSquadName.trim();
    if (!cleanName) return;

    const code = generateSquadCode('FIT');
    const newSquadObj: Squad = {
      id: `squad_${Date.now()}`,
      name: cleanName,
      code,
      motto: newSquadMotto.trim() || 'Entrenamos juntos, crecemos juntos.',
      discipline: newSquadDiscipline,
      creatorNickname: nickname,
      membersCount: 1,
      createdAt: Date.now()
    };

    const newMember: SquadMember = {
      id: `m_${Date.now()}`,
      squadId: newSquadObj.id,
      nickname,
      role: 'leader',
      joinedAt: Date.now(),
      streakDays: 1,
      hasCheckedInToday: false
    };

    setSquads((prev) => [newSquadObj, ...prev]);
    setMembers((prev) => ({
      ...prev,
      [newSquadObj.id]: [newMember]
    }));
    setActiveSquadId(newSquadObj.id);
    setShowCreateModal(false);
    setNewSquadName('');
    setNewSquadMotto('');
    playBeepSound();
    if (onNotification) onNotification(`¡Combo "${cleanName}" creado! Código de invitación: #${code}`);
  };

  // URL para invitar
  const inviteUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fitmax.app';
    return `${origin}/?squad=${currentSquad?.code || 'FITMAX'}`;
  }, [currentSquad]);

  // Si no hay ningún combo configurado (Estado vacío total)
  if (!currentSquad) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 max-w-lg mx-auto text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-[#1FD08A]/15 border border-[#1FD08A]/30 flex items-center justify-center text-[#1FD08A]">
          <Users className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#F4F2ED]">
            Crea tu combo y entrena con tus amigos
          </h2>
          <p className="text-xs sm:text-sm text-[#A8B0BB] leading-relaxed">
            Un combo es tu grupo privado de entrenamiento. Compitan en constancia, compartan rutinas y hagan check-in diario.
          </p>
        </div>

        {/* 3 Pasos */}
        <div className="w-full bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-left space-y-3.5">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1FD08A] text-[#15181D] font-black text-xs flex items-center justify-center shrink-0">1</span>
            <div>
              <p className="text-xs font-bold text-[#F4F2ED]">Crea tu combo</p>
              <p className="text-[11px] text-[#A8B0BB]">Elige un nombre y la disciplina deportiva de tu equipo.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1FD08A] text-[#15181D] font-black text-xs flex items-center justify-center shrink-0">2</span>
            <div>
              <p className="text-xs font-bold text-[#F4F2ED]">Invita con WhatsApp o QR</p>
              <p className="text-[11px] text-[#A8B0BB]">Tus amigos se unen con un solo toque y clonan tu plan.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#1FD08A] text-[#15181D] font-black text-xs flex items-center justify-center shrink-0">3</span>
            <div>
              <p className="text-xs font-bold text-[#F4F2ED]">Hagan su primer check-in</p>
              <p className="text-[11px] text-[#A8B0BB]">Sumen rachas y feliciten las sesiones en el muro diario.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-2xl text-xs shadow-md transition-all cursor-pointer"
          >
            Crear mi combo ahora
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 py-3.5 bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] text-[#F4F2ED] font-bold rounded-2xl text-xs transition-all cursor-pointer"
          >
            Unirme con código
          </button>
        </div>
      </div>
    );
  }

  const disciplineColor = getDisciplineColor(currentSquad.discipline);

  return (
    <div className="w-full space-y-5 animate-fadeIn pb-16">
      {/* SELECTOR RÁPIDO DE COMBOS (SI TIENE MÁS DE 1) */}
      {squads.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {squads.map((sq) => {
            const isSelected = sq.id === currentSquad.id;
            return (
              <button
                key={sq.id}
                onClick={() => setActiveSquadId(sq.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-[#20252C] border-[#1FD08A] text-[#1FD08A] shadow-sm'
                    : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                }`}
              >
                {sq.name}
              </button>
            );
          })}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs text-[#A8B0BB] hover:text-[#F4F2ED] border border-dashed border-[#282F38] hover:border-[#1FD08A] transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear</span>
          </button>
        </div>
      )}

      {/* CABECERA PRINCIPAL DEL COMBO */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-[#F4F2ED] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block border"
                style={{ 
                  backgroundColor: `${disciplineColor}20`, 
                  borderColor: `${disciplineColor}50`, 
                  color: disciplineColor 
                }}
              >
                {getDisciplineName(currentSquad.discipline)}
              </span>

              {isUserCaptain && (
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  👑 Capitán
                </span>
              )}

              <span className="text-[#A8B0BB] text-xs font-semibold">
                {currentMembers.length} {currentMembers.length === 1 ? 'miembro' : 'miembros'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#F4F2ED] tracking-tight">
              {currentSquad.name}
            </h2>
            <p className="text-xs text-[#A8B0BB] mt-0.5 max-w-lg">
              {currentSquad.motto}
            </p>
          </div>

          {/* BOTÓN PRINCIPAL: HACER CHECK-IN DE HOY */}
          <div>
            {userHasCheckedInToday ? (
              <div className="bg-[#1FD08A]/15 border border-[#1FD08A]/40 text-[#1FD08A] px-4 py-2 rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-black">Check-in de hoy listo</p>
                  <p className="text-[10px] text-[#A8B0BB]">Racha: {userMemberInfo?.streakDays || 1} días seguidos 🔥</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckinModal(true)}
                className="w-full sm:w-auto px-5 py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-[#15181D]" />
                <span>Hacer check-in de hoy</span>
              </button>
            )}
          </div>
        </div>

        {/* ACCIONES DE INVITACIÓN (WHATSAPP + QR + CÓDIGO) */}
        <div className="pt-3 border-t border-[#282F38] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#A8B0BB]">Código de combo:</span>
            <span className="font-mono text-xs font-black bg-[#15181D] px-2.5 py-1 rounded-lg border border-[#282F38] text-[#F4F2ED]">
              #{currentSquad.code}
            </span>
            <button
              onClick={() => handleCopyCode(currentSquad.code)}
              className="p-1.5 hover:bg-[#15181D] rounded-lg text-[#A8B0BB] hover:text-[#F4F2ED] transition-colors cursor-pointer"
              title="Copiar código"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#1FD08A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShareSquadWhatsApp}
              className="px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Invitar amigos por WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] text-[#F4F2ED] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Ver código QR de invitación"
            >
              <QrCode className="w-3.5 h-3.5 text-[#1FD08A]" />
              <span>Código QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* BLOQUE "HOY EN EL COMBO" (Section 10.2: ¿Quién entrenó hoy? + Racha grupal) */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-[#F4F2ED] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#FB923C]" />
            <h3 className="text-xs sm:text-sm font-black text-[#F4F2ED] uppercase tracking-wider">
              Hoy en el combo
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#1FD08A]">
            Racha de equipo: 4 semanas seguidas
          </span>
        </div>

        {/* Quién entrenó hoy */}
        <div>
          <p className="text-[11px] text-[#A8B0BB] mb-2">
            ¿Quién ya entrenó hoy? ({whoTrainedToday.length} de {currentMembers.length})
          </p>

          {whoTrainedToday.length === 0 ? (
            <div className="bg-[#15181D] border border-dashed border-[#282F38] rounded-2xl p-4 text-center text-[#A8B0BB]">
              <p className="text-xs font-semibold text-[#F4F2ED]">Nadie ha registrado entrenamiento hoy todavía.</p>
              <p className="text-[11px] text-[#A8B0BB] mt-0.5">
                ¡Sé el primero en romper el hielo y haz tu check-in! 🔥
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {whoTrainedToday.map((m) => (
                <div 
                  key={m.id} 
                  className="flex items-center gap-2.5 bg-[#15181D] border border-[#282F38] px-3 py-2 rounded-2xl shrink-0"
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2"
                    style={{ borderColor: disciplineColor, color: '#F4F2ED', backgroundColor: '#20252C' }}
                  >
                    {m.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F4F2ED] leading-tight">{m.nickname}</p>
                    <p className="text-[10px] text-[#1FD08A] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{m.lastActivityText || 'Entrenó hoy'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PESTAÑAS: MURO · RUTINAS · EQUIPO · RETOS */}
      <div className="flex items-center gap-1.5 border-b border-[#282F38] pb-2 overflow-x-auto">
        {[
          { id: 'wall', label: 'Muro', icon: MessageSquare },
          { id: 'routine', label: 'Rutinas', icon: Layers },
          { id: 'roster', label: 'Equipo', icon: Users },
          { id: 'challenges', label: 'Retos & Quedadas', icon: Trophy }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1FD08A] text-[#15181D] font-black shadow-sm'
                  : 'bg-[#20252C] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. PESTAÑA: MURO SOCIAL */}
      {activeSubTab === 'wall' && (
        <div className="space-y-4">
          {/* CREADOR DE POST */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-[#F4F2ED] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#15181D] border border-[#282F38] flex items-center justify-center font-black text-xs text-[#1FD08A]">
                {nickname.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-[#F4F2ED]">Publicar en {currentSquad.name}</span>
            </div>

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="¿Qué tal tu entrenamiento de hoy? Comparte tus sensaciones o foto..."
              rows={2}
              className="w-full bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-xs sm:text-sm text-[#F4F2ED] placeholder-[#A8B0BB]/60 focus:outline-none focus:border-[#1FD08A] resize-none"
            />

            {/* Vista previa de imagen seleccionada */}
            {compressedImage && (
              <div className="relative rounded-2xl overflow-hidden border border-[#282F38] max-h-56 bg-black">
                <img 
                  src={compressedImage.dataUrl} 
                  alt="Previa" 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={handleRemoveSelectedImage}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1FD08A]" />
                  <span>{isCompressing ? 'Optimizando...' : 'Añadir foto'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShareCardModal(true)}
                  className="px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span className="hidden sm:inline">Tarjeta resumen</span>
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={(!postContent.trim() && !compressedImage) || isPublishing}
                className="px-4 py-2 bg-[#1FD08A] hover:bg-[#1ab87a] disabled:opacity-40 text-[#15181D] font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Publicando...' : 'Publicar'}</span>
              </button>
            </div>
          </div>

          {/* LISTA DE PUBLICACIONES */}
          {currentPosts.length === 0 ? (
            <div className="bg-[#20252C] border border-dashed border-[#282F38] rounded-3xl p-8 text-center text-[#A8B0BB]">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#1FD08A]" />
              <p className="text-sm font-bold text-[#F4F2ED]">El muro está tranquilo hoy</p>
              <p className="text-xs text-[#A8B0BB] mt-1">Sé el primero en publicar una foto o un comentario sobre tu entreno.</p>
            </div>
          ) : (
            currentPosts.map((post) => {
              const isPostCaptain = currentSquad.creatorNickname.toLowerCase() === post.nickname.toLowerCase();
              const commentsOpen = !!expandedComments[post.id];

              return (
                <div 
                  key={post.id}
                  className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-[#F4F2ED] space-y-3 shadow-md"
                >
                  {/* Cabecera del post */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#15181D] border border-[#282F38] flex items-center justify-center font-black text-xs text-[#1FD08A]">
                        {post.nickname.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs sm:text-sm font-black text-[#F4F2ED]">{post.nickname}</p>
                          {isPostCaptain && (
                            <span className="text-[10px] text-amber-300 font-bold bg-amber-400/15 px-1.5 py-0.2 rounded">
                              👑 Capitán
                            </span>
                          )}
                          {post.isDemo && (
                            <span className="text-[9px] text-[#A8B0BB] bg-[#15181D] px-1.5 py-0.2 rounded border border-[#282F38]">
                              Ejemplo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#A8B0BB]">
                          {post.activityBadge && (
                            <span className="text-[#1FD08A] font-bold">{post.activityBadge}</span>
                          )}
                          <span>·</span>
                          <span>Hace unas horas</span>
                        </div>
                      </div>
                    </div>

                    {/* Menú de moderación */}
                    <div className="flex items-center gap-1">
                      {isUserCaptain && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-[#A8B0BB] hover:text-red-400 rounded-lg hover:bg-[#15181D] transition-colors cursor-pointer"
                          title="Eliminar publicación (Capitán)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleReportPost(post.id)}
                        className="p-1.5 text-[#A8B0BB] hover:text-amber-400 rounded-lg hover:bg-[#15181D] transition-colors cursor-pointer"
                        title="Reportar publicación"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contenido del post */}
                  <p className="text-xs sm:text-sm text-[#F4F2ED] leading-relaxed">
                    {post.content}
                  </p>

                  {/* Foto adjunta */}
                  {post.imageUrl && (
                    <div 
                      onClick={() => setFullscreenImage(post.imageUrl!)}
                      className="rounded-2xl overflow-hidden border border-[#282F38] cursor-pointer hover:opacity-95 transition-opacity max-h-80 bg-black flex items-center justify-center"
                    >
                      <img 
                        src={post.imageUrl} 
                        alt="Foto de entrenamiento" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  {/* Reacciones y Comentarios */}
                  <div className="pt-2 border-t border-[#282F38] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReaction(post.id, 'fire')}
                        className="px-2.5 py-1 bg-[#15181D] hover:bg-[#282F38] rounded-xl text-xs flex items-center gap-1.5 border border-[#282F38] text-[#F4F2ED] transition-colors cursor-pointer active:scale-95"
                      >
                        <span>🔥</span>
                        <span className="font-bold text-[11px]">{post.reactions?.fire || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, 'fist')}
                        className="px-2.5 py-1 bg-[#15181D] hover:bg-[#282F38] rounded-xl text-xs flex items-center gap-1.5 border border-[#282F38] text-[#F4F2ED] transition-colors cursor-pointer active:scale-95"
                      >
                        <span>👊</span>
                        <span className="font-bold text-[11px]">{post.reactions?.fist || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, 'muscle')}
                        className="px-2.5 py-1 bg-[#15181D] hover:bg-[#282F38] rounded-xl text-xs flex items-center gap-1.5 border border-[#282F38] text-[#F4F2ED] transition-colors cursor-pointer active:scale-95"
                      >
                        <span>💪</span>
                        <span className="font-bold text-[11px]">{post.reactions?.muscle || 0}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs text-[#A8B0BB] hover:text-[#F4F2ED] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments?.length ? `${post.comments.length} comentarios` : 'Comentar'}</span>
                    </button>
                  </div>

                  {/* Hilo de comentarios (desplegable) */}
                  {commentsOpen && (
                    <div className="pt-2 border-t border-[#282F38] space-y-2.5">
                      {/* Lista de comentarios existentes */}
                      {(post.comments || []).map((c) => (
                        <div key={c.id} className="bg-[#15181D] p-2.5 rounded-xl border border-[#282F38] text-xs">
                          <div className="flex items-center justify-between text-[10px] text-[#A8B0BB] mb-0.5">
                            <span className="font-bold text-[#F4F2ED]">{c.nickname}</span>
                            <span>Hace un momento</span>
                          </div>
                          <p className="text-[#F4F2ED]">{c.content}</p>
                        </div>
                      ))}

                      {/* Input para añadir comentario */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escribe un comentario..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 bg-[#15181D] border border-[#282F38] rounded-xl px-3 py-1.5 text-xs text-[#F4F2ED] placeholder-[#A8B0BB]/60 focus:outline-none focus:border-[#1FD08A]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] rounded-xl transition-all cursor-pointer"
                          title="Enviar comentario"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. PESTAÑA: RUTINAS COMPARTIDAS */}
      {activeSubTab === 'routine' && (
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-[#F4F2ED] space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] block">
                Plan de entrenamiento oficial
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#F4F2ED]">
                {currentSquad.sharedRoutine?.title || 'Rutina del combo'}
              </h3>
              <p className="text-xs text-[#A8B0BB] mt-0.5">
                {currentSquad.sharedRoutine?.description || 'Rutina diseñada y compartida para el equipo.'}
              </p>
            </div>

            <button
              onClick={handleCopyRoutineToWeekly}
              className="px-4 py-2.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar a mi plan semanal</span>
            </button>
          </div>

          {/* Días y ejercicios de la rutina */}
          <div className="space-y-3 pt-2">
            {(currentSquad.sharedRoutine?.daysData || []).map((day) => (
              <div key={day.dayId} className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 space-y-2">
                <p className="text-xs font-black text-[#1FD08A] uppercase tracking-wider">
                  {day.title}
                </p>
                <div className="space-y-1.5">
                  {day.exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#282F38]/50 last:border-0">
                      <span className="font-semibold text-[#F4F2ED]">{ex.name}</span>
                      <span className="text-[11px] text-[#A8B0BB] font-mono">{ex.sets} series · {ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PESTAÑA: EQUIPO (ROSTER DE MIEMBROS) */}
      {activeSubTab === 'roster' && (
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-[#F4F2ED] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#F4F2ED]">
              Miembros de {currentSquad.name} ({currentMembers.length})
            </h3>
            <button
              onClick={() => setShowJoinModal(true)}
              className="text-xs text-[#1FD08A] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Unirse con otro código</span>
            </button>
          </div>

          <div className="space-y-2">
            {currentMembers.map((member) => {
              const isLead = member.role === 'leader';
              const hasChecked = hasUserCheckedInToday(member.lastCheckinAt);

              return (
                <div 
                  key={member.id}
                  className="bg-[#15181D] border border-[#282F38] p-3 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2"
                      style={{ borderColor: disciplineColor, color: '#F4F2ED', backgroundColor: '#20252C' }}
                    >
                      {member.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-black text-[#F4F2ED]">{member.nickname}</p>
                        {isLead && (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-400/20 px-1.5 py-0.5 rounded">
                            👑 Capitán
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A8B0BB]">
                        Racha: <strong className="text-[#1FD08A]">{member.streakDays} días</strong> {hasChecked ? '· Entrenó hoy ✓' : '· Descanso'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasChecked ? (
                      <span className="w-3 h-3 rounded-full bg-[#1FD08A]" title="Entrenó hoy" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-[#A8B0BB]/30" title="Pendiente de entrenar hoy" />
                    )}

                    {isUserCaptain && member.nickname.toLowerCase() !== nickname.toLowerCase() && (
                      <button
                        onClick={() => handleRemoveMember(member.nickname)}
                        className="p-1.5 text-[#A8B0BB] hover:text-red-400 rounded-lg hover:bg-[#20252C] transition-colors cursor-pointer"
                        title="Expulsar del combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PESTAÑA: RETOS & QUEDADAS */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-4">
          {/* RETOS SEMANALES DE CONSTANCIA */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-[#F4F2ED] space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#F4F2ED]">Retos de constancia del equipo</h3>
                <p className="text-xs text-[#A8B0BB]">Metas grupales para sumar entre todos sin importar tu nivel.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Reto 1: Sesiones totales */}
              <div className="bg-[#15181D] border border-[#282F38] p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F4F2ED]">20 entrenamientos en equipo esta semana</span>
                  <span className="text-[#1FD08A] font-black">14 / 20 sesiones (70%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#20252C] overflow-hidden">
                  <div className="h-full bg-[#1FD08A] rounded-full" style={{ width: '70%' }} />
                </div>
                <p className="text-[10px] text-[#A8B0BB]">Faltan 6 entrenamientos antes del domingo para completar el reto.</p>
              </div>

              {/* Reto 2: Kilómetros acumulados */}
              <div className="bg-[#15181D] border border-[#282F38] p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F4F2ED]">50 kilómetros de carrera acumulados</span>
                  <span className="text-[#5B8DEF] font-black">38 / 50 km (76%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#20252C] overflow-hidden">
                  <div className="h-full bg-[#5B8DEF] rounded-full" style={{ width: '76%' }} />
                </div>
                <p className="text-[10px] text-[#A8B0BB]">¡Solo faltan 12 km entre todos para ganar la medalla de equipo!</p>
              </div>
            </div>
          </div>

          {/* QUEDADAS DE ENTRENAMIENTO (MEETUPS) */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-[#F4F2ED] space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1FD08A]" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#F4F2ED]">Quedadas de entrenamiento</h3>
                  <p className="text-xs text-[#A8B0BB]">Entrenen juntos en vivo en el gimnasio o al aire libre.</p>
                </div>
              </div>

              <button
                onClick={() => setShowNewMeetupModal(true)}
                className="px-3 py-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Proponer quedada</span>
              </button>
            </div>

            {currentMeetups.length === 0 ? (
              <div className="bg-[#15181D] border border-dashed border-[#282F38] rounded-2xl p-6 text-center text-[#A8B0BB]">
                <p className="text-xs font-semibold text-[#F4F2ED]">No hay quedadas programadas próximamente.</p>
                <p className="text-[11px] text-[#A8B0BB] mt-0.5">Propón un día, hora y lugar para entrenar juntos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMeetups.map((meet) => {
                  const userIsGoing = meet.attendees.includes(nickname);
                  const userDeclined = meet.declined.includes(nickname);

                  return (
                    <div key={meet.id} className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-[#1FD08A] font-black uppercase tracking-wider mb-0.5">
                          <span>{meet.date}</span>
                          <span>·</span>
                          <span>{meet.time}</span>
                        </div>
                        <h4 className="text-sm font-black text-[#F4F2ED]">{meet.title}</h4>
                        <p className="text-xs text-[#A8B0BB] flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{meet.location}</span>
                        </p>
                      </div>

                      {/* Asistentes */}
                      <div className="pt-2 border-t border-[#282F38] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#A8B0BB]">
                          <span>Asistentes ({meet.attendees.length}):</span>
                          <span className="font-bold text-[#F4F2ED]">{meet.attendees.join(', ')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespondMeetup(meet.id, true)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              userIsGoing
                                ? 'bg-[#1FD08A] text-[#15181D] font-black'
                                : 'bg-[#20252C] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38]'
                            }`}
                          >
                            ✓ Voy
                          </button>
                          <button
                            onClick={() => handleRespondMeetup(meet.id, false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              userDeclined
                                ? 'bg-red-500/20 text-red-300 border border-red-500'
                                : 'bg-[#20252C] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38]'
                            }`}
                          >
                            No puedo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CÓDIGO QR PARA INVITAR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-[#F4F2ED]">Código QR de invitación</h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-[#A8B0BB] hover:text-[#F4F2ED] rounded-xl hover:bg-[#15181D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A8B0BB]">
              Pídele a tu compañero que escanee este código con la cámara de su celular para unirse a <strong>{currentSquad.name}</strong>.
            </p>

            <div className="p-4 bg-white rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-md">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`} 
                alt="QR Code" 
                className="w-full h-full"
              />
            </div>

            <div className="bg-[#15181D] border border-[#282F38] p-3 rounded-2xl flex items-center justify-between">
              <span className="font-mono text-sm font-black text-[#1FD08A]">#{currentSquad.code}</span>
              <button
                onClick={() => handleCopyCode(currentSquad.code)}
                className="text-xs font-bold text-[#F4F2ED] hover:text-[#1FD08A] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECK-IN DIARIO */}
      {showCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] text-[#F4F2ED] rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#1FD08A]" />
                <h3 className="font-extrabold text-base text-[#F4F2ED]">Check-in diario de entrenamiento</h3>
              </div>
              <button
                onClick={() => setShowCheckinModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-[#F4F2ED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A8B0BB] mb-4">
              Marca tu asistencia en <strong>{currentSquad.name}</strong> para mantener tu racha activa de días consecutivos.
            </p>

            <form onSubmit={handleRecordCheckin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1.5">
                  Tipo de actividad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'strength', label: 'Musculación' },
                    { id: 'running', label: 'Running' },
                    { id: 'hyrox_ocr', label: 'Hyrox / OCR' },
                    { id: 'hiit', label: 'HIIT / Cardio' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCheckinType(t.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        checkinType === t.id
                          ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-[#1FD08A]'
                          : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1.5">
                  Título de la sesión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Día 1 Torso Pesado, 8K Z2, etc."
                  value={checkinTitle}
                  onChange={(e) => setCheckinTitle(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1.5">
                  Sensación o comentario (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: RIR 2 respetado, buena energía..."
                  value={checkinDetails}
                  onChange={(e) => setCheckinDetails(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
              >
                Confirmar check-in de hoy 🔥
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TARJETA DE RESUMEN COMPARTIBLE */}
      {showShareCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-[#F4F2ED]">Tarjeta de resumen</h3>
              <button 
                onClick={() => setShowShareCardModal(false)}
                className="p-1.5 text-[#A8B0BB] hover:text-[#F4F2ED] rounded-xl hover:bg-[#15181D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tarjeta compartible de marca */}
            <div className="bg-gradient-to-br from-[#15181D] to-[#20252C] border-2 border-[#1FD08A] p-5 rounded-2xl text-left space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-[#1FD08A] tracking-wider uppercase">FitMax</span>
                <span className="text-[10px] text-[#A8B0BB]">Entrenamiento Inteligente</span>
              </div>

              <div>
                <p className="text-xs text-[#A8B0BB]">Atleta</p>
                <p className="text-base font-black text-[#F4F2ED]">{nickname}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#282F38]">
                <div>
                  <p className="text-[10px] text-[#A8B0BB]">Disciplina</p>
                  <p className="text-xs font-bold text-[#1FD08A]">{getDisciplineName(currentSquad.discipline)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#A8B0BB]">Racha activa</p>
                  <p className="text-xs font-bold text-[#FB923C]">{userMemberInfo?.streakDays || 1} días 🔥</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowShareCardModal(false);
                  if (onNotification) onNotification('¡Tarjeta publicada en tu muro!');
                }}
                className="flex-1 py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all cursor-pointer"
              >
                Publicar en combo
              </button>
              <button
                onClick={() => {
                  setShowShareCardModal(false);
                  handleShareSquadWhatsApp();
                }}
                className="px-4 py-3 bg-[#15181D] hover:bg-[#282F38] text-[#F4F2ED] rounded-xl text-xs font-bold border border-[#282F38] cursor-pointer"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROPONER NUEVA QUEDADA */}
      {showNewMeetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] text-[#F4F2ED] rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1FD08A]" />
                <h3 className="font-extrabold text-base text-[#F4F2ED]">Proponer quedada de entrenamiento</h3>
              </div>
              <button
                onClick={() => setShowNewMeetupModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-[#F4F2ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetup} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Título de la quedada</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Simulacro Hyrox en Parque Virrey"
                  value={newMeetupTitle}
                  onChange={(e) => setNewMeetupTitle(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Día</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sábado 18 Oct"
                    value={newMeetupDate}
                    onChange={(e) => setNewMeetupDate(e.target.value)}
                    className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Hora</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 08:00 AM"
                    value={newMeetupTime}
                    onChange={(e) => setNewMeetupTime(e.target.value)}
                    className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Lugar de encuentro</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Parque Simón Bolívar, entrada principal"
                  value={newMeetupLocation}
                  onChange={(e) => setNewMeetupLocation(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
              >
                Publicar quedada para el equipo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR COMBO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] text-[#F4F2ED] rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
              <h3 className="font-extrabold text-base text-[#F4F2ED]">Crear nuevo combo</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-[#F4F2ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSquad} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Nombre del combo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Titanes del Cross, Corredores Z2..."
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Lema o motivación</label>
                <input
                  type="text"
                  placeholder="Ej: La constancia no se negocia."
                  value={newSquadMotto}
                  onChange={(e) => setNewSquadMotto(e.target.value)}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-xs text-[#F4F2ED] focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">Disciplina principal</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hybrid', label: 'Híbrido' },
                    { id: 'strength', label: 'Musculación' },
                    { id: 'running', label: 'Running' },
                    { id: 'hyrox_ocr', label: 'Hyrox / OCR' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setNewSquadDiscipline(d.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newSquadDiscipline === d.id
                          ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-[#1FD08A]'
                          : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
              >
                Crear combo e invitar amigos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UNIRSE CON CÓDIGO */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] text-[#F4F2ED] rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
              <h3 className="font-extrabold text-base text-[#F4F2ED]">Unirme a un combo existente</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-[#F4F2ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinSquadByCode} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#F4F2ED] block mb-1">
                  Código de invitación (6 caracteres)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: HYR902, RUN820..."
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F4F2ED] uppercase tracking-wider focus:outline-none focus:border-[#1FD08A]"
                />
                {joinError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{joinError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
              >
                Unirme al combo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VISOR DE FOTO PANTALLA COMPLETA */}
      {fullscreenImage && (
        <div 
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fadeIn cursor-zoom-out"
        >
          <img 
            src={fullscreenImage} 
            alt="Foto completa" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl" 
          />
        </div>
      )}
    </div>
  );
}
