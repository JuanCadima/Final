const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/);
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
} catch (err) {
  console.error('Error reading .env.local:', err.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_WALKERS = [
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    location: 'San Francisco, CA',
    rating: 5.0,
    reviews_count: 148,
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    tags: ['Más Valorada', 'Primeros Auxilios Certificados'],
    tagline: 'Llevando alegría, ejercicio y una sensación de calma a los miembros peludos de tu familia desde 2018.',
    about_paragraphs: [
      "¡Hola! Soy Sarah, una entusiasta de los animales de toda la vida y compañera canina profesional. Creo que cada perro merece un paseo que no sea solo ejercicio físico, sino también estimulación mental y conexión emocional.",
      "Comencé Paws&Pause porque noté que muchos dueños de mascotas en la ciudad tenían dificultades para encontrar paseadores que realmente entendieran el comportamiento de los perros y las necesidades de cada raza. Mi enfoque es paciente, amable y siempre centrado en la seguridad y felicidad de tu mascota."
    ],
    photos: {
      large: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=500',
      sm1: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=300',
      sm2: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300',
      tall: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    experience: [
      { icon: '✓', bg: '#dff2cc', color: '#5a8a29', title: 'Paseadora de Perros Profesional Certificada', desc: 'Asociación Internacional de Profesionales Caninos (IACP)' },
      { icon: '✚', bg: '#faeab1', color: '#9c750b', title: 'Certificada en Primeros Auxilios y RCP para Mascotas', desc: 'Certificación de la Cruz Roja (Vigente)' },
      { icon: '★', bg: '#fcdfc3', color: '#b05f25', title: 'Más de 5 Años de Experiencia Profesional', desc: 'Más de 2500 paseos exitosos completados en San Francisco.' }
    ],
    reviews: [
      {
        author: "Jessica K. y 'Cooper'",
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Sarah es absolutamente increíble. Cooper solía tener ansiedad cuando me iba a trabajar, pero desde que Sarah comenzó a pasearlo, es otro perro: tranquilo, feliz y claramente muy querido. ¡Sus fotos diarias son lo mejor de mi día!"
      },
      {
        author: "David M. y 'Luna'",
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Extremadamente confiable y comunicativa. Tengo un Husky de alta energía que necesita mucha actividad, y Sarah lo maneja a la perfección. ¡Recomiendo encarecidamente La Hora de la Aventura para dueños de razas grandes!"
      }
    ]
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    location: 'Oakland, CA',
    rating: 4.8,
    reviews_count: 64,
    price: 28,
    image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    tags: ['Cuidado de Cachorros', 'Trato Delicado'],
    tagline: 'Paciente y experimentada con perros mayores y cachorros que están aprendiendo a pasear.',
    about_paragraphs: [
      "¡Hola, soy Elena! Tengo una profunda pasión por los cachorros y los perros de edad avanzada que requieren un toque más suave. Entiendo que el mundo puede ser un lugar grande e abrumador para un cachorro o un perro mayor delicado.",
      "Mis paseos se centran en la seguridad, el refuerzo positivo, los aspectos básicos del entrenamiento con correa y la exploración a ritmo lento adaptada al nivel de comodidad física de tu perro."
    ],
    photos: {
      large: 'https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?auto=format&fit=crop&q=80&w=500',
      sm1: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=300',
      sm2: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=300',
      tall: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    experience: [
      { icon: '🍼', bg: '#ffe3e3', color: '#c92a2a', title: 'Experta en Socialización de Cachorros', desc: 'Se enfoca en buenos modales con la correa y en generar confianza al aire libre desde temprana edad.' },
      { icon: '🩺', bg: '#e3fafc', color: '#0b7285', title: 'Capacitada en Cuidado de Mascotas de Edad Avanzada', desc: 'Entrenada en consideraciones de movilidad articular y administración de medicamentos.' },
      { icon: '✓', bg: '#dff2cc', color: '#5a8a29', title: 'Cuidadora de Mascotas Certificada', desc: 'Miembro de Pet Sitters International (PSI).' }
    ],
    reviews: [
      {
        author: "Clara S. y 'Teddy'",
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
        stars: 5,
        quote: "Elena es muy paciente con nuestro Golden Retriever de 3 meses Teddy. ¡Nos ayudó a reforzar su entrenamiento para ir al baño y en su transportadora durante sus paseos, y él la adora!"
      }
    ]
  }
];

const MOCK_DOGS = [
  {
    name: 'Max',
    breed: 'Golden Retriever',
    photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=200'
  }
];

async function seed() {
  console.log('Deleting David Chen from database...');
  await supabase.from('walkers').delete().eq('id', 'david-chen');

  console.log('Seeding walkers...');
  const { data: walkersData, error: walkersError } = await supabase
    .from('walkers')
    .upsert(MOCK_WALKERS);

  if (walkersError) {
    console.error('Error seeding walkers:', walkersError);
  } else {
    console.log('Walkers seeded successfully!');
  }

  console.log('Seeding dogs...');
  // Check if dogs table has data
  const { data: existingDogs, error: queryError } = await supabase.from('dogs').select('id');
  if (queryError) {
    console.error('Error querying dogs table (make sure tables are created in Supabase first):', queryError);
    return;
  }
  
  if (!existingDogs || existingDogs.length === 0) {
    const { data: dogsData, error: dogsError } = await supabase
      .from('dogs')
      .insert(MOCK_DOGS);

    if (dogsError) {
      console.error('Error seeding dogs:', dogsError);
    } else {
      console.log('Dogs seeded successfully!');
    }
  } else {
    console.log('Dogs table already has data, skipping dog seed.');
  }
}

seed();
