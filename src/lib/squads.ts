import { supabase } from './supabaseClient';

export type SquadDiscipline = 'hybrid' | 'strength' | 'running' | 'hyrox_ocr';

export interface SharedExercise {
  name: string;
  sets: number;
  reps: string;
}

export interface SharedDay {
  dayId: number;
  title: string;
  exercises: SharedExercise[];
}

export interface SharedRoutinePayload {
  title: string;
  discipline: SquadDiscipline;
  description: string;
  authorNickname: string;
  sharedAt: number;
  type: 'weekly_4day' | 'custom_bank';
  targetWeeks?: number;
  cycleLabel?: string;
  daysData?: SharedDay[];
  exercisesData?: SharedExercise[];
}

export interface Squad {
  id: string;
  name: string;
  code: string;
  motto: string;
  discipline: SquadDiscipline;
  creatorNickname: string;
  creatorId?: string;
  sharedRoutine?: SharedRoutinePayload | null;
  membersCount: number;
  createdAt: number;
}

export interface SquadMember {
  id: string;
  squadId: string;
  nickname: string;
  role: 'leader' | 'admin' | 'member';
  joinedAt: number;
  lastCheckinAt?: number;
  lastActivityText?: string;
  streakDays: number;
  hasCheckedInToday?: boolean;
}

export interface SquadCheckin {
  id: string;
  squadId: string;
  nickname: string;
  activityType: 'strength' | 'running' | 'hyrox_ocr' | 'hiit' | 'custom';
  activityTitle: string;
  details?: string;
  createdAt: number;
}

export interface SquadComment {
  id: string;
  nickname: string;
  content: string;
  createdAt: number;
}

export interface SquadMeetup {
  id: string;
  squadId: string;
  creatorNickname: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  attendees: string[]; // nicknames
  declined: string[];
  createdAt: number;
}

export interface SquadChallenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  discipline: SquadDiscipline;
  daysRemaining: number;
}

export interface SquadPost {
  id: string;
  squadId: string;
  userId?: string;
  nickname: string;
  content: string;
  imageUrl?: string;
  activityBadge?: string;
  discipline?: SquadDiscipline;
  stats?: {
    durationMinutes?: number;
    volumeKg?: number;
    distanceKm?: number;
    pace?: string;
  };
  reactions: {
    fire: number;
    fist: number;
    muscle: number;
  };
  comments?: SquadComment[];
  isDemo?: boolean;
  createdAt: number;
}

export const DEFAULT_SQUAD_POSTS: Record<string, SquadPost[]> = {
  squad_hyrox_titans: [
    {
      id: 'post_h1',
      squadId: 'squad_hyrox_titans',
      nickname: 'Coach_Marcos',
      content: '¡Día de simulacro cerrado! Recuerden no apresurarse en los primeros 1000m de carrera tras el trineo; mantengan la cadencia corta.',
      activityBadge: 'Simulacro Hyrox',
      discipline: 'hyrox_ocr',
      reactions: { fire: 4, fist: 3, muscle: 2 },
      isDemo: true,
      comments: [
        { id: 'c_1', nickname: 'Lucas_Hyrox', content: '¡Totalmente de acuerdo, la cadencia salva el día!', createdAt: Date.now() - 3600000 * 2 }
      ],
      createdAt: Date.now() - 3600000 * 3
    },
    {
      id: 'post_h2',
      squadId: 'squad_hyrox_titans',
      nickname: 'Lucas_Hyrox',
      content: 'Completé las 4 rondas de Wall Balls y Farmer Carry pesado. La fatiga acumulada quemaba pero salió todo en ritmo.',
      activityBadge: 'Estaciones Hyrox',
      discipline: 'hyrox_ocr',
      reactions: { fire: 3, fist: 2, muscle: 4 },
      isDemo: true,
      createdAt: Date.now() - 3600000 * 6
    }
  ],
  squad_polar_runners: [
    {
      id: 'post_r1',
      squadId: 'squad_polar_runners',
      nickname: 'Elena_Run',
      content: 'Rodaje regenerativo de 12 km completado en Zona 2 estricta (138 ppm media). Mañana descansamos para las series del jueves.',
      activityBadge: 'Rodaje Z2 12K',
      discipline: 'running',
      reactions: { fire: 5, fist: 2, muscle: 1 },
      isDemo: true,
      createdAt: Date.now() - 3600000 * 4
    }
  ],
  squad_hypertrophy_brotherhood: [
    {
      id: 'post_s1',
      squadId: 'squad_hypertrophy_brotherhood',
      nickname: 'Carlos_Lift',
      content: 'Semana 4 del mesociclo: subí a 85kg en banca manteniendo RIR 1. La sobrecarga progresiva no falla.',
      activityBadge: 'Torso A - Semana 4',
      discipline: 'strength',
      reactions: { fire: 6, fist: 5, muscle: 7 },
      isDemo: true,
      createdAt: Date.now() - 3600000 * 5
    }
  ]
};

// Cuadrillas iniciales / públicas predeterminadas para testing local y demostración
export const DEFAULT_COMMUNITY_SQUADS: Squad[] = [
  {
    id: 'squad_hyrox_titans',
    name: 'Titanes Hyrox & Funcional',
    code: 'HYR202',
    motto: 'Corremos con piernas fatigadas, conquistamos cada estación.',
    discipline: 'hyrox_ocr',
    creatorNickname: 'Coach_Marcos',
    membersCount: 8,
    createdAt: Date.now() - 86400000 * 14,
    sharedRoutine: {
      title: 'Simulacro Combinado Compromised Running',
      discipline: 'hyrox_ocr',
      description: 'Bloque de 800m zancadas lastradas + SkiErg + 1km carrera sostenida a ritmo de competición.',
      authorNickname: 'Coach_Marcos',
      sharedAt: Date.now() - 86400000 * 2,
      type: 'weekly_4day',
      targetWeeks: 4,
      cycleLabel: '4 semanas',
      daysData: [
        {
          dayId: 1,
          title: 'Día 1: Estaciones de Empuje & Tracción',
          exercises: [
            { name: 'Sled Push (Empuje de Trineo)', sets: 4, reps: '50m' },
            { name: 'Sled Pull (Arrastre con Cuerda)', sets: 4, reps: '50m' },
            { name: 'Burpee Broad Jumps', sets: 4, reps: '20m' },
            { name: 'Sandbag Lunges', sets: 3, reps: '100m' }
          ]
        },
        {
          dayId: 2,
          title: 'Día 2: Potencia de Pierna, Carries & Wall Balls',
          exercises: [
            { name: 'Wall Balls (Lanzamiento de Balón)', sets: 4, reps: '25 reps' },
            { name: 'Remo Ergómetro (Rowing) + 1km Carrera', sets: 4, reps: '500m' },
            { name: 'Farmers Carry Pesados (Mancuernas/Kettlebells)', sets: 4, reps: '100m' }
          ]
        }
      ]
    }
  },
  {
    id: 'squad_polar_runners',
    name: 'Club Polarizado 80/20',
    code: 'RUN820',
    motto: '80% base aeróbica Z2, 20% a fuego en series VO2 Máx.',
    discipline: 'running',
    creatorNickname: 'Elena_Run',
    membersCount: 12,
    createdAt: Date.now() - 86400000 * 20,
    sharedRoutine: {
      title: 'Semana Tipo Polarizada 4 Días',
      discipline: 'running',
      description: 'Distribución óptima Seiler: 2 días Z2 suave, 1 día intervalos umbral y 1 tirada larga.',
      authorNickname: 'Elena_Run',
      sharedAt: Date.now() - 86400000 * 5,
      type: 'weekly_4day',
      targetWeeks: 8,
      cycleLabel: '8 semanas',
      daysData: [
        {
          dayId: 1,
          title: 'Día 1: Rodaje Suave Z2',
          exercises: [{ name: 'Carrera continua Z2 conversacional', sets: 1, reps: '8 km @ 5:45/km' }]
        },
        {
          dayId: 2,
          title: 'Día 2: Series de Umbral / VO2 Máx',
          exercises: [{ name: 'Intervalos 5x1000m @ ritmo 10k con 90s rec', sets: 5, reps: '1000m @ 4:20/km' }]
        },
        {
          dayId: 3,
          title: 'Día 3: Rodaje Regenerativo',
          exercises: [{ name: 'Trote suave Z1/Z2 activo', sets: 1, reps: '6 km @ 6:00/km' }]
        },
        {
          dayId: 4,
          title: 'Día 4: Tirada Larga Progresiva',
          exercises: [{ name: 'Fondo aeróbico de fin de semana', sets: 1, reps: '16 km progresivo' }]
        }
      ]
    }
  },
  {
    id: 'squad_hypertrophy_brotherhood',
    name: 'Hermandad Torso / Pierna',
    code: 'IRON04',
    motto: 'Sobrecarga progresiva, RIR 1-2 y técnica antes del ego.',
    discipline: 'strength',
    creatorNickname: 'Carlos_Lift',
    membersCount: 15,
    createdAt: Date.now() - 86400000 * 30,
    sharedRoutine: {
      title: 'Mesociclo Torso/Pierna Frecuencia 2',
      discipline: 'strength',
      description: 'Rutina balanceada de 4 días enfocada en hipertrofia miofibrilar y progresión de cargas.',
      authorNickname: 'Carlos_Lift',
      sharedAt: Date.now() - 86400000 * 1,
      type: 'weekly_4day',
      targetWeeks: 8,
      cycleLabel: '8 semanas',
      daysData: [
        {
          dayId: 1,
          title: 'Torso Fuerza & Potencia',
          exercises: [
            { name: 'Press banca plano con barra', sets: 4, reps: '6-8' },
            { name: 'Remo con barra inclinado', sets: 4, reps: '8-10' },
            { name: 'Press militar de pie con mancuernas', sets: 3, reps: '8-10' },
            { name: 'Jalón al pecho agarre neutro', sets: 3, reps: '10-12' }
          ]
        },
        {
          dayId: 2,
          title: 'Pierna Énfasis Cuádriceps',
          exercises: [
            { name: 'Sentadilla trasera con barra libre', sets: 4, reps: '6-8' },
            { name: 'Prensa inclinada a 45°', sets: 3, reps: '10-12' },
            { name: 'Curl femoral tumbado', sets: 4, reps: '10-12' },
            { name: 'Elevación de talones gemelo', sets: 4, reps: '12-15' }
          ]
        }
      ]
    }
  }
];

// Generador de código alfanumérico limpio de 6 caracteres (ej. HYR902)
export function generateSquadCode(prefix: string = ''): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin 0, 1, O, I para evitar ambigüedades
  let result = '';
  const targetLen = 6;
  const cleanPrefix = prefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3);
  result += cleanPrefix;
  while (result.length < targetLen) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result.slice(0, 6);
}

// Validación de formato de código
export function validateSquadCode(code: string): boolean {
  return /^[A-Z0-9]{5,7}$/i.test(code.trim());
}

// Verifica si una marca de tiempo corresponde al día de hoy en la zona horaria local
export function hasUserCheckedInToday(lastCheckinAt?: number): boolean {
  if (!lastCheckinAt) return false;
  const checkinDate = new Date(lastCheckinAt);
  const today = new Date();
  return (
    checkinDate.getDate() === today.getDate() &&
    checkinDate.getMonth() === today.getMonth() &&
    checkinDate.getFullYear() === today.getFullYear()
  );
}

// Calcula la racha de días consecutivos
export function calculateStreak(currentStreak: number, lastCheckinAt?: number): number {
  if (!lastCheckinAt) return 1;
  const lastDate = new Date(lastCheckinAt);
  const today = new Date();
  
  // Normalizar a medianoche
  const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diffDays = Math.round((todayDay - lastDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return Math.max(1, currentStreak); // Ya entrenó hoy
  } else if (diffDays === 1) {
    return currentStreak + 1; // Entrenó ayer y entrena hoy: +1 día de racha
  } else {
    return 1; // Se rompió la racha: reinicia en 1
  }
}

// ==========================================
// OPERACIONES EN NUBE (SUPABASE) CON FALLBACK
// ==========================================

export async function fetchSquadByCodeCloud(code: string): Promise<Squad | null> {
  if (!supabase) return null;
  const cleanCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('squads')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    code: data.code,
    motto: data.motto || '',
    discipline: data.discipline as SquadDiscipline,
    creatorNickname: data.creator_id ? 'Líder' : 'Comunidad',
    creatorId: data.creator_id,
    sharedRoutine: data.shared_routine,
    membersCount: 1,
    createdAt: new Date(data.created_at).getTime()
  };
}

export async function createSquadCloud(
  userId: string,
  nickname: string,
  name: string,
  discipline: SquadDiscipline,
  motto: string = '',
  sharedRoutine: SharedRoutinePayload | null = null
): Promise<Squad | null> {
  if (!supabase) return null;
  const code = generateSquadCode(discipline === 'running' ? 'RUN' : discipline === 'strength' ? 'LIFT' : 'HYR');

  const { data: squadData, error: squadErr } = await supabase
    .from('squads')
    .insert([
      {
        name,
        code,
        motto,
        discipline,
        creator_id: userId,
        shared_routine: sharedRoutine
      }
    ])
    .select()
    .single();

  if (squadErr || !squadData) {
    console.error('Error creating squad in cloud', squadErr);
    return null;
  }

  // Auto-inscribir al creador como líder
  await supabase.from('squad_members').insert([
    {
      squad_id: squadData.id,
      user_id: userId,
      nickname,
      role: 'leader',
      streak_days: 1,
      last_checkin_at: new Date().toISOString(),
      last_activity_text: 'Fundó la cuadrilla'
    }
  ]);

  return {
    id: squadData.id,
    name: squadData.name,
    code: squadData.code,
    motto: squadData.motto || '',
    discipline: squadData.discipline as SquadDiscipline,
    creatorNickname: nickname,
    creatorId: userId,
    sharedRoutine: squadData.shared_routine,
    membersCount: 1,
    createdAt: new Date(squadData.created_at).getTime()
  };
}

export async function joinSquadCloud(
  squadId: string,
  userId: string,
  nickname: string
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('squad_members').upsert([
    {
      squad_id: squadId,
      user_id: userId,
      nickname,
      role: 'member'
    }
  ], { onConflict: 'squad_id,user_id' });

  return !error;
}

export async function fetchSquadMembersCloud(squadId: string): Promise<SquadMember[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('squad_members')
    .select('*')
    .eq('squad_id', squadId)
    .order('streak_days', { ascending: false });

  if (error || !data) return [];

  return data.map((m) => {
    const lastCheckinAt = m.last_checkin_at ? new Date(m.last_checkin_at).getTime() : undefined;
    return {
      id: m.id,
      squadId: m.squad_id,
      nickname: m.nickname,
      role: m.role as 'leader' | 'member',
      joinedAt: new Date(m.joined_at).getTime(),
      lastCheckinAt,
      lastActivityText: m.last_activity_text || undefined,
      streakDays: m.streak_days || 0,
      hasCheckedInToday: hasUserCheckedInToday(lastCheckinAt)
    };
  });
}

export async function fetchSquadCheckinsCloud(squadId: string): Promise<SquadCheckin[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('squad_checkins')
    .select('*')
    .eq('squad_id', squadId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error || !data) return [];

  return data.map((c) => ({
    id: c.id,
    squadId: c.squad_id,
    nickname: c.nickname,
    activityType: c.activity_type as SquadCheckin['activityType'],
    activityTitle: c.activity_title,
    details: c.details || undefined,
    createdAt: new Date(c.created_at).getTime()
  }));
}

export async function postSquadCheckinCloud(
  squadId: string,
  userId: string,
  nickname: string,
  activityType: SquadCheckin['activityType'],
  activityTitle: string,
  details: string = ''
): Promise<SquadCheckin | null> {
  if (!supabase) return null;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('squad_checkins')
    .insert([
      {
        squad_id: squadId,
        user_id: userId,
        nickname,
        activity_type: activityType,
        activity_title: activityTitle,
        details
      }
    ])
    .select()
    .single();

  if (error || !data) {
    console.error('Error posting checkin in cloud', error);
    return null;
  }

  // Actualizar último checkin en squad_members
  await supabase
    .from('squad_members')
    .update({
      last_checkin_at: now,
      last_activity_text: activityTitle
    })
    .match({ squad_id: squadId, user_id: userId });

  return {
    id: data.id,
    squadId: data.squad_id,
    nickname: data.nickname,
    activityType: data.activity_type as SquadCheckin['activityType'],
    activityTitle: data.activity_title,
    details: data.details || undefined,
    createdAt: new Date(data.created_at).getTime()
  };
}

export async function shareRoutineToSquadCloud(
  squadId: string,
  userId: string,
  payload: SharedRoutinePayload
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('squads')
    .update({ shared_routine: payload })
    .eq('id', squadId);

  return !error;
}

export async function fetchSquadPostsCloud(squadId: string): Promise<SquadPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('squad_posts')
    .select('*')
    .eq('squad_id', squadId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    squadId: p.squad_id,
    userId: p.user_id || undefined,
    nickname: p.nickname,
    content: p.content,
    imageUrl: p.image_url || undefined,
    activityBadge: p.activity_badge || undefined,
    reactions: p.reactions || { fire: 0, fist: 0, muscle: 0 },
    createdAt: new Date(p.created_at).getTime()
  }));
}

export async function createSquadPostCloud(
  squadId: string,
  userId: string,
  nickname: string,
  content: string,
  imageUrl?: string,
  activityBadge?: string
): Promise<SquadPost | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('squad_posts')
    .insert([
      {
        squad_id: squadId,
        user_id: userId,
        nickname,
        content,
        image_url: imageUrl || null,
        activity_badge: activityBadge || null,
        reactions: { fire: 0, fist: 0, muscle: 0 }
      }
    ])
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating squad post in cloud', error);
    return null;
  }

  return {
    id: data.id,
    squadId: data.squad_id,
    userId: data.user_id || undefined,
    nickname: data.nickname,
    content: data.content,
    imageUrl: data.image_url || undefined,
    activityBadge: data.activity_badge || undefined,
    reactions: data.reactions || { fire: 0, fist: 0, muscle: 0 },
    createdAt: new Date(data.created_at).getTime()
  };
}

export async function reactToSquadPostCloud(
  postId: string,
  reactionType: 'fire' | 'fist' | 'muscle',
  currentReactions: SquadPost['reactions']
): Promise<boolean> {
  if (!supabase) return false;
  const updatedReactions = {
    ...currentReactions,
    [reactionType]: (currentReactions[reactionType] || 0) + 1
  };

  const { error } = await supabase
    .from('squad_posts')
    .update({ reactions: updatedReactions })
    .eq('id', postId);

  return !error;
}

