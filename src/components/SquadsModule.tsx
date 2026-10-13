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
  Mountain, 
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
  Trash2
} from 'lucide-react';
import { 
  Squad, 
  SquadMember, 
  SquadCheckin, 
  SquadPost,
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
import { buildSquadInviteMessage, buildStreakShareMessage, shareContent } from '../lib/share';

interface SquadsModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

export default function SquadsModule({ nickname, onNotification }: SquadsModuleProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [softWallTrigger, setSoftWallTrigger] = useState<SoftWallTrigger | null>(null);

  // Lista de cuadrillas guardadas localmente por el usuario
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

  // Pestaña activa dentro de la cuadrilla: Muro Social, Rutina Compartida, Check-in/Roster
  const [activeSubTab, setActiveSubTab] = useState<'wall' | 'routine' | 'checkin'>('wall');

  // Miembros de la cuadrilla activa
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

  // Check-ins de la cuadrilla activa
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

  // Publicaciones del Muro Social
  const [posts, setPosts] = useState<Record<string, SquadPost[]>>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_squad_posts_v1`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SQUAD_POSTS;
  });

  // Estado del creador de posts
  const [postContent, setPostContent] = useState<string>('');
  const [postBadge, setPostBadge] = useState<string>('Entrenamiento General');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Visor de imagen en pantalla completa
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Formulario de nueva cuadrilla
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

  // Cuadrilla actual seleccionada
  const currentSquad = useMemo(() => {
    return squads.find((s) => s.id === activeSquadId) || squads[0] || null;
  }, [squads, activeSquadId]);

  const currentMembers = useMemo(() => {
    return currentSquad ? members[currentSquad.id] || [] : [];
  }, [members, currentSquad]);

  const currentCheckins = useMemo(() => {
    return currentSquad ? checkins[currentSquad.id] || [] : [];
  }, [checkins, currentSquad]);

  const currentPosts = useMemo(() => {
    return currentSquad ? posts[currentSquad.id] || [] : [];
  }, [posts, currentSquad]);

  // Verificar si hay combos demo presentes
  const hasDemoSquads = useMemo(() => {
    const demoIds = ['squad_hyrox_titans', 'squad_polar_runners', 'squad_hypertrophy_brotherhood'];
    return squads.some((s) => demoIds.includes(s.id));
  }, [squads]);

  // Salir o eliminar un combo
  const handleDeleteSquad = (squadId: string) => {
    const target = squads.find((s) => s.id === squadId);
    if (!target) return;
    if (window.confirm(`¿Estás seguro de que deseas salir o eliminar el combo "${target.name}"?`)) {
      const updated = squads.filter((s) => s.id !== squadId);
      setSquads(updated);
      try {
        localStorage.setItem(`fit_gen_${nickname}_squads_v1`, JSON.stringify(updated));
      } catch {}
      if (updated.length > 0) {
        setActiveSquadId(updated[0].id);
      } else {
        setActiveSquadId('');
      }
      if (onNotification) {
        onNotification(`Has salido del combo "${target.name}".`);
      }
    }
  };

  // Limpiar todos los combos de ejemplo predeterminados
  const handleClearDemoSquads = () => {
    if (window.confirm('¿Deseas limpiar todos los combos de ejemplo predeterminados? Tus combos propios creados se mantendrán.')) {
      const demoIds = ['squad_hyrox_titans', 'squad_polar_runners', 'squad_hypertrophy_brotherhood'];
      const updated = squads.filter((s) => !demoIds.includes(s.id));
      setSquads(updated);
      try {
        localStorage.setItem(`fit_gen_${nickname}_squads_v1`, JSON.stringify(updated));
      } catch {}
      if (updated.length > 0) {
        setActiveSquadId(updated[0].id);
      } else {
        setActiveSquadId('');
      }
      if (onNotification) {
        onNotification('Combos de ejemplo eliminados.');
      }
    }
  };

  // Restaurar combos de ejemplo
  const handleRestoreDemoSquads = () => {
    setSquads(DEFAULT_COMMUNITY_SQUADS);
    setActiveSquadId(DEFAULT_COMMUNITY_SQUADS[0].id);
    try {
      localStorage.setItem(`fit_gen_${nickname}_squads_v1`, JSON.stringify(DEFAULT_COMMUNITY_SQUADS));
    } catch {}
    if (onNotification) {
      onNotification('Combos de ejemplo restaurados.');
    }
  };

  // Comprobar si el usuario ya hizo check-in hoy
  const userMemberInfo = useMemo(() => {
    return currentMembers.find((m) => m.nickname.toLowerCase() === nickname.toLowerCase());
  }, [currentMembers, nickname]);

  const userHasCheckedInToday = useMemo(() => {
    return hasUserCheckedInToday(userMemberInfo?.lastCheckinAt);
  }, [userMemberInfo]);

  // Miembros ordenados para el Podio de Honor (Top 3 por días de racha)
  const podiumMembers = useMemo(() => {
    return [...currentMembers]
      .sort((a, b) => (b.streakDays || 0) - (a.streakDays || 0))
      .slice(0, 3);
  }, [currentMembers]);

  // Copiar código al portapapeles
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    playBeepSound();
    if (onNotification) onNotification(`¡Código ${code} copiado! Compártelo con tus amigos.`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Manejador viral de WhatsApp para invitar amigos al Combo
  const handleShareSquadWhatsApp = async () => {
    playBeepSound();
    const text = buildSquadInviteMessage(currentSquad.name, currentSquad.code);
    const res = await shareContent({
      title: `Únete a mi combo en FitMax: ${currentSquad.name}`,
      text
    });
    if (res.method === 'clipboard' && onNotification) {
      onNotification('¡Mensaje de invitación copiado al portapapeles!');
    } else if (onNotification) {
      onNotification('¡Abriendo WhatsApp para compartir tu combo!');
    }
  };

  // Manejador viral de WhatsApp para compartir racha activa
  const handleShareStreakWhatsApp = async () => {
    playBeepSound();
    const streak = userMemberInfo?.streakDays || 1;
    const text = buildStreakShareMessage(nickname, streak, currentSquad.name);
    const res = await shareContent({
      title: `Mi racha en FitMax con ${currentSquad.name}`,
      text
    });
    if (res.method === 'clipboard' && onNotification) {
      onNotification('¡Mensaje de racha copiado al portapapeles!');
    } else if (onNotification) {
      onNotification('¡Abriendo WhatsApp para presumir tu racha!');
    }
  };

  // Manejadores con Intercepción Soft Wall («Modo Puerta Abierta»)
  const handleOpenJoin = () => {
    if (!user) {
      setSoftWallTrigger('join_squad');
    } else {
      setShowJoinModal(true);
    }
  };

  const handleOpenCreate = () => {
    if (!user) {
      setSoftWallTrigger('share_routine');
    } else {
      setShowCreateModal(true);
    }
  };

  const handlePhotoClick = (e: React.MouseEvent) => {
    if (!user && !compressedImage) {
      e.preventDefault();
      setSoftWallTrigger('upload_photo');
    }
  };

  // Manejador de selección y compresión WebP automática de imagen
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
        onNotification(`Foto optimizada en WebP: de ${result.originalSizeKB} KB a solo ${result.compressedSizeKB} KB (${result.savingsPercentage}% ahorro).`);
      }
    } catch (err) {
      console.error(err);
      if (onNotification) onNotification('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveSelectedImage = () => {
    setSelectedFile(null);
    setCompressedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Publicar en el Muro Social
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = postContent.trim();
    if (!cleanText && !compressedImage) return;

    setIsPublishing(true);

    let finalImageUrl: string | undefined = undefined;

    // Subida a Supabase Storage (o DataUrl local)
    if (selectedFile) {
      try {
        const uploadResult = await uploadSquadImage(selectedFile, currentSquad.id, user?.id);
        finalImageUrl = uploadResult.url;
      } catch (err) {
        console.error('Error subiendo imagen', err);
        finalImageUrl = compressedImage?.dataUrl;
      }
    }

    const newPost: SquadPost = {
      id: `post_${Date.now()}`,
      squadId: currentSquad.id,
      userId: user?.id,
      nickname,
      content: cleanText || '¡Entrenamiento completado hoy con el equipo! 🔥',
      imageUrl: finalImageUrl,
      activityBadge: postBadge,
      reactions: { fire: 1, fist: 0, muscle: 0 },
      createdAt: Date.now()
    };

    // Actualizar estado local
    setPosts((prev) => ({
      ...prev,
      [currentSquad.id]: [newPost, ...(prev[currentSquad.id] || [])]
    }));

    // Si hay usuario en Supabase, registrar en la nube
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

    // Limpiar formulario
    setPostContent('');
    handleRemoveSelectedImage();
    setIsPublishing(false);
    playBeepSound();
    if (onNotification) onNotification('¡Publicación compartida con la cuadrilla!');
  };

  // Reaccionar a una publicación
  const handleReaction = async (postId: string, type: 'fire' | 'fist' | 'muscle') => {
    playBeepSound();
    setPosts((prev) => {
      const currentList = prev[currentSquad.id] || [];
      const targetPost = currentList.find((p) => p.id === postId);
      if (!targetPost) return prev;

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

      if (user && targetPost) {
        reactToSquadPostCloud(postId, type, targetPost.reactions);
      }

      return {
        ...prev,
        [currentSquad.id]: updated
      };
    });
  };

  // Crear cuadrilla
  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSquadName.trim();
    if (!cleanName) return;

    let sharedPayload: SharedRoutinePayload | null = null;
    if (includeMyRoutine) {
      try {
        const weeklyRoutine = JSON.parse(localStorage.getItem(`fit_gen_${nickname}_weekly_routine_v1`) || 'null');
        if (weeklyRoutine && weeklyRoutine.days) {
          sharedPayload = {
            title: `Rutina de ${nickname}`,
            discipline: newSquadDiscipline,
            description: `Plan Torso/Pierna de 4 días compartido por ${nickname}.`,
            authorNickname: nickname,
            sharedAt: Date.now(),
            type: 'weekly_4day',
            daysData: weeklyRoutine.days.map((d: any) => ({
              dayId: d.dayId,
              title: d.title,
              exercises: d.exercises.map((ex: any) => ({
                name: ex.name,
                sets: ex.targetSets,
                reps: ex.targetReps
              }))
            }))
          };
        }
      } catch (err) {
        console.error(err);
      }
    }

    let created: Squad;
    if (user) {
      const cloudSquad = await createSquadCloud(
        user.id,
        nickname,
        cleanName,
        newSquadDiscipline,
        newSquadMotto.trim(),
        sharedPayload
      );
      if (cloudSquad) {
        created = cloudSquad;
      } else {
        const code = generateSquadCode(newSquadDiscipline === 'running' ? 'RUN' : newSquadDiscipline === 'strength' ? 'LIFT' : 'HYR');
        created = {
          id: `squad_local_${Date.now()}`,
          name: cleanName,
          code,
          motto: newSquadMotto.trim() || 'Juntos hacia la cima.',
          discipline: newSquadDiscipline,
          creatorNickname: nickname,
          sharedRoutine: sharedPayload,
          membersCount: 1,
          createdAt: Date.now()
        };
      }
    } else {
      const code = generateSquadCode(newSquadDiscipline === 'running' ? 'RUN' : newSquadDiscipline === 'strength' ? 'LIFT' : 'HYR');
      created = {
        id: `squad_local_${Date.now()}`,
        name: cleanName,
        code,
        motto: newSquadMotto.trim() || 'Juntos hacia la cima.',
        discipline: newSquadDiscipline,
        creatorNickname: nickname,
        sharedRoutine: sharedPayload,
        membersCount: 1,
        createdAt: Date.now()
      };
    }

    const leaderMember: SquadMember = {
      id: `m_${Date.now()}`,
      squadId: created.id,
      nickname,
      role: 'leader',
      joinedAt: Date.now(),
      streakDays: 1,
      lastCheckinAt: Date.now(),
      lastActivityText: 'Creó el combo',
      hasCheckedInToday: true
    };

    setSquads((prev) => [created, ...prev]);
    setMembers((prev) => ({
      ...prev,
      [created.id]: [leaderMember]
    }));
    setActiveSquadId(created.id);
    setShowCreateModal(false);
    setNewSquadName('');
    setNewSquadMotto('');

    playBeepSound();
    if (onNotification) onNotification(`¡Combo "${created.name}" creado con éxito! Código: ${created.code}`);
  };

  // Unirse a combo mediante código
  const handleJoinSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!validateSquadCode(cleanCode)) {
      setJoinError('El código debe tener entre 5 y 7 caracteres alfanuméricos.');
      return;
    }

    setJoinError(null);

    let target = squads.find((s) => s.code.toUpperCase() === cleanCode);

    if (!target && user) {
      target = await fetchSquadByCodeCloud(cleanCode) || undefined;
    }

    if (!target) {
      target = {
        id: `squad_joined_${cleanCode}`,
        name: `Combo #${cleanCode}`,
        motto: 'Unidos para conquistar cada sesión.',
        code: cleanCode,
        discipline: cleanCode.startsWith('RUN') ? 'running' : cleanCode.startsWith('LIFT') ? 'strength' : 'hyrox_ocr',
        creatorNickname: 'Capitán',
        membersCount: 2,
        createdAt: Date.now()
      };
    }

    const newMember: SquadMember = {
      id: `m_${Date.now()}`,
      squadId: target.id,
      nickname,
      role: 'member',
      joinedAt: Date.now(),
      streakDays: 1,
      hasCheckedInToday: false
    };

    setSquads((prev) => (prev.some((s) => s.id === target!.id) ? prev : [target!, ...prev]));
    setMembers((prev) => {
      const existing = prev[target!.id] || [];
      if (existing.some((m) => m.nickname.toLowerCase() === nickname.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        [target!.id]: [...existing, newMember]
      };
    });

    if (user) {
      await joinSquadCloud(target.id, user.id, nickname);
    }

    setActiveSquadId(target.id);
    setShowJoinModal(false);
    setJoinCodeInput('');
    playBeepSound();
    if (onNotification) onNotification(`¡Te has unido al combo "${target.name}"!`);
  };

  // Registrar Check-in del día
  const handleRecordCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = checkinTitle.trim();
    if (!cleanTitle) return;

    const currentStreak = userMemberInfo?.streakDays || 0;
    const newStreak = calculateStreak(currentStreak, userMemberInfo?.lastCheckinAt);

    const newCheckin: SquadCheckin = {
      id: `checkin_${Date.now()}`,
      squadId: currentSquad.id,
      nickname,
      activityType: checkinType,
      activityTitle: cleanTitle,
      details: checkinDetails.trim() || undefined,
      createdAt: Date.now()
    };

    setCheckins((prev) => ({
      ...prev,
      [currentSquad.id]: [newCheckin, ...(prev[currentSquad.id] || [])]
    }));

    setMembers((prev) => {
      const currentList = prev[currentSquad.id] || [];
      const updatedList = currentList.map((m) => {
        if (m.nickname.toLowerCase() === nickname.toLowerCase()) {
          return {
            ...m,
            streakDays: newStreak,
            lastCheckinAt: Date.now(),
            lastActivityText: cleanTitle,
            hasCheckedInToday: true
          };
        }
        return m;
      });

      if (!currentList.some((m) => m.nickname.toLowerCase() === nickname.toLowerCase())) {
        updatedList.push({
          id: `m_${Date.now()}`,
          squadId: currentSquad.id,
          nickname,
          role: 'member',
          joinedAt: Date.now(),
          streakDays: newStreak,
          lastCheckinAt: Date.now(),
          lastActivityText: cleanTitle,
          hasCheckedInToday: true
        });
      }

      return {
        ...prev,
        [currentSquad.id]: updatedList
      };
    });

    if (user) {
      await postSquadCheckinCloud(
        currentSquad.id,
        user.id,
        nickname,
        checkinType,
        cleanTitle,
        checkinDetails.trim()
      );
    }

    setShowCheckinModal(false);
    setCheckinTitle('');
    setCheckinDetails('');
    playBeepSound();
    if (onNotification) onNotification(`¡Check-in registrado! Racha activa de ${newStreak} día(s). 🔥`);
  };

  // Clonar rutina compartida de la cuadrilla a mi plan local
  const handleCloneRoutineToMyPlan = () => {
    if (!currentSquad.sharedRoutine) {
      if (onNotification) onNotification('Esta cuadrilla no tiene una rutina compartida activa.');
      return;
    }

    const payload = currentSquad.sharedRoutine;

    if (payload.daysData && payload.daysData.length > 0) {
      const weeklyRoutineFormatted = {
        name: payload.title,
        split: 'Torso / Pierna Frecuencia 2',
        description: payload.description,
        days: payload.daysData.map((d) => ({
          dayId: d.dayId,
          title: d.title,
          focus: d.title,
          exercises: d.exercises.map((ex, idx) => ({
            id: `shared_ex_${d.dayId}_${idx}`,
            name: ex.name,
            targetSets: ex.sets || 4,
            targetReps: ex.reps || '8-10',
            weight: '0',
            rir: 2,
            restSec: 90
          }))
        }))
      };

      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_routine_v1`, JSON.stringify(weeklyRoutineFormatted));
        localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(Date.now()));
        playBeepSound();
        if (onNotification) onNotification(`¡Rutina "${payload.title}" clonada con éxito en tu Plan Semanal!`);
      } catch (err) {
        console.error(err);
      }
    } else {
      if (onNotification) onNotification('Formato de rutina no compatible para clonado directo.');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-cyan-100 text-cyan-900 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 border border-cyan-300">
              <Users className="w-3 h-3 text-cyan-700" /> Mi Combo &amp; Muro Social
            </span>
            <span className="text-zinc-400 text-xs font-bold">
              {squads.length} Combos Activos
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-600" />
            Mi Combo: Muro Social y Rutinas
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Publica fotos de tus entrenamientos con compresión instantánea, comparte planes con tu combo y reacciona a los logros de tus compañeros.
          </p>
        </div>

        {/* ACCIONES SUPERIORES */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenJoin}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-zinc-600" />
            <span>Unirme con Código</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Crear mi Combo</span>
          </button>
        </div>
      </div>

      {/* SELECTOR DE CUADRILLAS (PILLS RESPONSIVAS) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {squads.map((squad) => (
            <button
              key={squad.id}
              onClick={() => setActiveSquadId(squad.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 border ${
                activeSquadId === squad.id
                  ? 'bg-zinc-900 text-white border-zinc-700 shadow-md ring-2 ring-cyan-500/30'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              {squad.discipline === 'running' ? (
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              ) : squad.discipline === 'strength' ? (
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Mountain className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{squad.name}</span>
              <span className="text-[10px] bg-zinc-800/80 text-zinc-300 px-1.5 py-0.2 rounded-md font-mono">
                #{squad.code}
              </span>
            </button>
          ))}
        </div>

        {hasDemoSquads && (
          <button
            onClick={handleClearDemoSquads}
            className="shrink-0 text-[11px] font-bold text-zinc-500 hover:text-rose-600 bg-zinc-100 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all border border-zinc-200 hover:border-rose-200 flex items-center gap-1.5 ml-auto"
            title="Eliminar los combos de ejemplo predeterminados"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar ejemplos</span>
          </button>
        )}
      </div>

      {!currentSquad ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-center max-w-lg mx-auto my-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No tienes combos activos</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Crea tu propio combo para entrenar con tus amigos, o únete al combo de tu box usando un código de invitación.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi Combo</span>
            </button>
            <button
              onClick={handleOpenJoin}
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-zinc-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Unirme con Código</span>
            </button>
          </div>
          <button
            onClick={handleRestoreDemoSquads}
            className="mt-6 text-[11px] text-zinc-500 hover:text-zinc-300 underline font-medium transition-colors"
          >
            ¿Quieres ver cómo funciona? Cargar combos de ejemplo
          </button>
        </div>
      ) : (
        <>
          {/* TARJETA HERO DE LA CUADRILLA SELECCIONADA */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    Disciplina: {currentSquad.discipline.toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">
                    Capitán: <strong className="text-zinc-200">{currentSquad.creatorNickname}</strong>
                  </span>
                  <span className="text-xs text-zinc-400 font-bold">
                    • {currentMembers.length} Miembros
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {currentSquad.name}
                </h3>
                
                <p className="text-xs text-zinc-300 italic mt-1 max-w-xl">
                  "{currentSquad.motto || 'Juntos hacia la superación de cada límite.'}"
                </p>
              </div>

              {/* CÓDIGO DE INVITACIÓN + CHECK-IN + SALIR */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                {/* Tarjeta de código */}
                <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 block font-bold">
                      Código de invitación
                    </span>
                    <span className="text-lg font-black tracking-widest font-mono text-cyan-300">
                      {currentSquad.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(currentSquad.code)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-2.5 rounded-xl transition-colors border border-zinc-600"
                      title="Copiar código al portapapeles"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleShareSquadWhatsApp}
                      className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black px-3 py-2.5 rounded-xl transition-all border border-emerald-400 shadow-md shadow-emerald-600/25 flex items-center gap-1.5 active:scale-95"
                      title="Invitar a tus amigos al combo por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-black">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Botón Check-in de Hoy */}
                <button
                  onClick={() => setShowCheckinModal(true)}
                  className={`py-3.5 px-5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                    userHasCheckedInToday
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-emerald-500/20'
                  }`}
                >
                  {userHasCheckedInToday ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Check-in Listo (🔥 {userMemberInfo?.streakDays}d)</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 text-zinc-950 animate-pulse" />
                      <span>Hacer Check-in de Hoy</span>
                    </>
                  )}
                </button>

                {/* Botón Salir / Borrar Combo */}
                <button
                  onClick={() => handleDeleteSquad(currentSquad.id)}
                  className="bg-zinc-900/90 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-300 p-3 rounded-2xl transition-all border border-zinc-700/80 hover:border-rose-700/60 flex items-center justify-center gap-1.5 text-xs font-bold shrink-0"
                  title="Salir de este combo o eliminarlo"
                >
                  <Trash2 className="w-4 h-4 text-zinc-400 hover:text-rose-400" />
                  <span className="hidden sm:inline text-[11px]">Salir / Borrar</span>
                </button>
              </div>
            </div>
          </div>

      {/* SUB-NAVEGACIÓN DENTRO DE LA CUADRILLA: MURO SOCIAL, RUTINA COMPARTIDA, CHECK-IN */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveSubTab('wall')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'wall'
              ? 'bg-zinc-900 text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Muro Social &amp; Fotos ({currentPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('routine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'routine'
              ? 'bg-zinc-900 text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Rutina Compartida</span>
        </button>

        <button
          onClick={() => setActiveSubTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            activeSubTab === 'checkin'
              ? 'bg-zinc-900 text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Asistencia &amp; Roster ({currentMembers.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: MURO SOCIAL Y SUBIDA DE FOTOS                  */}
      {/* ========================================================= */}
      {activeSubTab === 'wall' && (
        <div className="space-y-6">
          
          {/* CAJA DE CREACIÓN DE PUBLICACIÓN CON COMPRESIÓN WEBP */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-white shadow-xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md">
                {nickname.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-white">{nickname}</p>
                <p className="text-[10px] text-zinc-400">Publicando en {currentSquad.name}</p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="¿Cómo te fue en el entreno hoy? Comparte tus tiempos, sensaciones o sube una foto de tu sesión..."
                rows={3}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 resize-none"
              />

              {/* PREVISUALIZACIÓN DE IMAGEN COMPRIMIDA */}
              {compressedImage && (
                <div className="bg-zinc-900 border border-cyan-800/60 rounded-2xl p-3 flex items-center justify-between gap-3 relative animate-fadeIn">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img 
                      src={compressedImage.dataUrl} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-xl border border-zinc-700 shadow-md cursor-pointer"
                      onClick={() => setFullscreenImage(compressedImage.dataUrl)}
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1 w-fit">
                        <Sparkles className="w-3 h-3" /> WebP Optimizado
                      </span>
                      <p className="text-[11px] font-bold text-zinc-300 mt-1">
                        {compressedImage.originalSizeKB} KB → <strong className="text-emerald-400">{compressedImage.compressedSizeKB} KB</strong> ({compressedImage.savingsPercentage}% ahorro)
                      </p>
                      <p className="text-[10px] text-zinc-500">Resolución ajustada a 1080px para máxima velocidad</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveSelectedImage}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-xl transition-colors"
                    title="Quitar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* BARRA INFERIOR DE ACCIONES */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="post-image-input"
                  />

                  <label
                    htmlFor={user || compressedImage ? "post-image-input" : undefined}
                    onClick={handlePhotoClick}
                    className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      compressedImage
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>{isCompressing ? 'Comprimiendo WebP...' : compressedImage ? 'Cambiar Foto' : 'Adjuntar Foto'}</span>
                  </label>

                  {/* Selector de etiqueta de actividad */}
                  <select
                    value={postBadge}
                    onChange={(e) => setPostBadge(e.target.value)}
                    className="bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl px-2.5 py-2 text-[11px] focus:outline-none focus:border-cyan-400 font-bold"
                  >
                    <option value="Entrenamiento General">Entrenamiento General</option>
                    <option value="Torso Hipertrofia">Torso Hipertrofia</option>
                    <option value="Pierna Fuerza">Pierna Fuerza</option>
                    <option value="Running Z2 Suave">Running Z2 Suave</option>
                    <option value="Series / Umbral">Series / Umbral</option>
                    <option value="Simulacro Hyrox">Simulacro Hyrox</option>
                    <option value="Agarre & OCR">Agarre &amp; OCR</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing || (!postContent.trim() && !compressedImage)}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-black px-5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPublishing ? 'Publicando...' : 'Publicar'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* LISTADO DE PUBLICACIONES EN EL FEED */}
          <div className="space-y-4">
            {currentPosts.length === 0 ? (
              <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl p-8 text-center text-zinc-500">
                <MessageSquare className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                <p className="text-xs font-bold text-zinc-700">El muro de este combo aún no tiene publicaciones.</p>
                <p className="text-[11px] text-zinc-500 mt-1">¡Sé el primero en subir tu foto de entreno o saludar al combo!</p>
              </div>
            ) : (
              currentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-white shadow-lg space-y-3 relative overflow-hidden"
                >
                  {/* Encabezado del post */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-black text-xs">
                        {post.nickname.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{post.nickname}</span>
                          {post.activityBadge && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                              {post.activityBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} a las {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido de texto */}
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Foto adjunta */}
                  {post.imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 max-h-96 bg-zinc-900 group">
                      <img
                        src={post.imageUrl}
                        alt="Foto de entrenamiento"
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <button
                        onClick={() => setFullscreenImage(post.imageUrl!)}
                        className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-xl text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Ver en pantalla completa"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Barra de Reacciones de Camaradería */}
                  <div className="pt-2 border-t border-zinc-850 flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(post.id, 'fire')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-amber-400 transition-all hover:scale-105 active:scale-95"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{post.reactions.fire || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, 'fist')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-cyan-400 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>👊</span>
                      <span>{post.reactions.fist || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, 'muscle')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-emerald-400 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>💪</span>
                      <span>{post.reactions.muscle || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: RUTINA COMPARTIDA DEL EQUIPO                  */}
      {/* ========================================================= */}
      {activeSubTab === 'routine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-2">
            <h4 className="text-base font-black tracking-tight text-zinc-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              Rutina Oficial del Combo
            </h4>

            {currentSquad.sharedRoutine && (
              <button
                onClick={handleCloneRoutineToMyPlan}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Copiar a mi Plan</span>
              </button>
            )}
          </div>

          {currentSquad.sharedRoutine ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 text-white shadow-md space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                    Plan Activo del Combo
                  </span>
                  <h5 className="text-lg font-black text-white mt-1">
                    {currentSquad.sharedRoutine.title}
                  </h5>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {currentSquad.sharedRoutine.description}
                  </p>
                </div>
              </div>

              {/* Días y ejercicios */}
              <div className="space-y-3 pt-2">
                {currentSquad.sharedRoutine.daysData?.map((day) => (
                  <div key={day.dayId} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5">
                    <p className="text-xs font-black text-zinc-200 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {day.title}
                    </p>
                    <div className="space-y-1.5">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-zinc-950/60 p-2 rounded-xl border border-zinc-850">
                          <span className="font-semibold text-zinc-300">{ex.name}</span>
                          <span className="font-black text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md text-[11px]">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCloneRoutineToMyPlan}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sincronizar y Entrenar este Plan en mi Semana</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl p-8 text-center text-zinc-500">
              <Layers className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-xs font-bold text-zinc-700">Este combo aún no tiene una rutina compartida fija.</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                El capitán puede compartir su rutina activa o exportar un bloque de 4 días para que todo el combo entrene en sincronía.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: CHECK-IN DIARIO & ROSTER DEL EQUIPO            */}
      {/* ========================================================= */}
      {activeSubTab === 'checkin' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-2">
            <h4 className="text-base font-black tracking-tight text-zinc-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Asistencia &amp; Racha de Hoy
            </h4>
            <span className="text-xs font-bold text-zinc-500">
              {currentMembers.filter((m) => m.hasCheckedInToday).length} / {currentMembers.length} entrenaron hoy
            </span>
          </div>

          {/* PODIO DE HONOR DEL COMBO (TOP 3 ATLETAS) */}
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    Podio de Honor del Combo
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                      TOP CONSISTENCIA
                    </span>
                  </h4>
                  <p className="text-[10px] text-zinc-400">Clasificación en vivo por mayor racha de días consecutivos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1er Lugar - ORO */}
              {podiumMembers[0] && (
                <div className="bg-amber-950/40 border border-amber-500/70 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg relative order-1 sm:order-2 ring-1 ring-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🥇</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-600">
                      1º Puesto
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white truncate">{podiumMembers[0].nickname}</p>
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Flame className="w-3.5 h-3.5" /> {podiumMembers[0].streakDays} días de racha
                    </p>
                  </div>
                </div>
              )}

              {/* 2do Lugar - PLATA */}
              {podiumMembers[1] && (
                <div className="bg-zinc-900/90 border border-slate-400/50 rounded-2xl p-3.5 flex flex-col justify-between shadow-md order-2 sm:order-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🥈</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-zinc-800 px-2 py-0.5 rounded-md border border-slate-600">
                      2º Puesto
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-200 truncate">{podiumMembers[1].nickname}</p>
                    <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 text-slate-400" /> {podiumMembers[1].streakDays} días de racha
                    </p>
                  </div>
                </div>
              )}

              {/* 3er Lugar - BRONCE */}
              {podiumMembers[2] && (
                <div className="bg-zinc-900/90 border border-amber-800/50 rounded-2xl p-3.5 flex flex-col justify-between shadow-md order-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🥉</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-amber-900">
                      3º Puesto
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-200 truncate">{podiumMembers[2].nickname}</p>
                    <p className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 text-amber-600" /> {podiumMembers[2].streakDays} días de racha
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE MIEMBROS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 text-white shadow-md space-y-2.5">
            {currentMembers.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  member.hasCheckedInToday
                    ? 'bg-emerald-950/30 border-emerald-800/60'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                    member.hasCheckedInToday
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {member.nickname.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">
                        {member.nickname}
                      </span>
                      {member.role === 'leader' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 rounded-sm font-bold">
                          CAPITÁN
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {member.lastActivityText || 'Sin registro reciente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.hasCheckedInToday ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                      <Flame className="w-3 h-3" /> {member.streakDays}d racha
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Pendiente hoy
                    </span>
                  )}

                  {/* Botón compartir racha si es el usuario actual */}
                  {member.nickname.toLowerCase() === nickname.toLowerCase() && member.streakDays > 0 && (
                    <button
                      onClick={handleShareStreakWhatsApp}
                      className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-xl border border-emerald-500/50 transition-colors"
                      title="Presumir mi racha en WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FEED DE CHECK-INS RECIENTES */}
          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-600" /> Muro de Asistencia Reciente
            </h5>

            <div className="space-y-2">
              {currentCheckins.slice(0, 6).map((chk) => (
                <div key={chk.id} className="bg-white border border-zinc-200 rounded-2xl p-3 shadow-sm text-zinc-900">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-cyan-700 font-extrabold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      {chk.nickname}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(chk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs font-black text-zinc-800">
                    {chk.activityTitle}
                  </p>
                  {chk.details && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                      "{chk.details}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </>
    )}

      {/* MODAL FOTO EN PANTALLA COMPLETA */}
      {fullscreenImage && (
        <div 
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 rounded-full text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={fullscreenImage}
              alt="Foto ampliada"
              className="max-h-[85vh] max-w-full object-contain rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* MODAL CREAR CUADRILLA */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-cyan-400" />
              Crear Nuevo Combo
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Crea tu grupo de entrenamiento con código alfanumérico para invitar a tus compañeros del combo.
            </p>

            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Nombre del Combo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Los Titanes, Iron Combo, Team Cali..."
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Lema o Frase de Guerra
                </label>
                <input
                  type="text"
                  placeholder="Ej: Corremos con piernas fatigadas..."
                  value={newSquadMotto}
                  onChange={(e) => setNewSquadMotto(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Disciplina Principal
                </label>
                <select
                  value={newSquadDiscipline}
                  onChange={(e) => setNewSquadDiscipline(e.target.value as SquadDiscipline)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="hybrid">Híbrido (Todo terreno)</option>
                  <option value="hyrox_ocr">Hyrox &amp; Carreras OCR</option>
                  <option value="strength">Fuerza &amp; Musculación</option>
                  <option value="running">Running Polarizado 80/20</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="includeRoutine"
                  checked={includeMyRoutine}
                  onChange={(e) => setIncludeMyRoutine(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <label htmlFor="includeRoutine" className="text-xs text-zinc-300 cursor-pointer">
                  Compartir mi rutina activa actual con el combo
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black rounded-xl text-xs transition-colors mt-2 shadow-md shadow-cyan-500/20"
              >
                Crear mi Combo 🔥
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UNIRSE CON CÓDIGO */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Unirme a un Combo
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Ingresa el código alfanumérico de 6 caracteres que te compartió tu compañero del combo (ej. HYR202).
            </p>

            <form onSubmit={handleJoinSquad} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={7}
                  required
                  placeholder="CÓDIGO (ej. HYR202)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center text-lg font-black tracking-widest font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                {joinError && (
                  <p className="text-[11px] text-red-400 font-bold mt-1.5">{joinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black rounded-xl text-xs transition-colors shadow-md"
              >
                Unirme Ahora
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR CHECK-IN */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowCheckinModal(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-emerald-400" />
              Check-in Diario de Entrenamiento
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Marca tu asistencia en {currentSquad.name} para mantener tu racha activa de días consecutivos en el combo.
            </p>

            <form onSubmit={handleRecordCheckin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Tipo de Actividad Realizada
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'strength', label: 'Musculación' },
                    { id: 'running', label: 'Running Z2/Series' },
                    { id: 'hyrox_ocr', label: 'Hyrox / OCR' },
                    { id: 'hiit', label: 'HIIT Metabólico' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCheckinType(t.id as SquadCheckin['activityType'])}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        checkinType === t.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Día 1 Torso Pesado, 10 km Z2..."
                  value={checkinTitle}
                  onChange={(e) => setCheckinTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Sensación o Comentario (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: RIR 2 respetado, buena congestión..."
                  value={checkinDetails}
                  onChange={(e) => setCheckinDetails(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-colors mt-2 shadow-md"
              >
                Confirmar Check-in de Hoy 🔥
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SOFT WALL («MODO PUERTA ABIERTA») */}
      <SoftWallModal
        isOpen={!!softWallTrigger}
        trigger={softWallTrigger || 'join_squad'}
        onClose={() => setSoftWallTrigger(null)}
        onContinueAsGuest={() => {
          const trigger = softWallTrigger;
          setSoftWallTrigger(null);
          if (trigger === 'join_squad') {
            setShowJoinModal(true);
          } else if (trigger === 'share_routine') {
            setShowCreateModal(true);
          } else if (trigger === 'upload_photo') {
            fileInputRef.current?.click();
          }
        }}
      />

    </div>
  );
}
