import { Timestamp } from 'firebase/firestore'
import type { Event, NewsArticle, GalleryImage, MembershipApplication } from './types'

// Mock Events
export const getMockEvents = (): Event[] => [
  {
    id: 'event-1',
    title: 'Alumni-Jahrestreffen 2024',
    date: Timestamp.fromDate(new Date('2024-06-15T18:00:00')),
    location: 'Hainberg-Gymnasium, Aula',
    description: 'Unser jährliches Treffen aller Alumni mit Rückblick auf das vergangene Jahr und Ausblick auf kommende Projekte.',
    isFeatured: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-15'))
  },
  {
    id: 'event-2',
    title: 'Ehemaligenstammtisch',
    date: Timestamp.fromDate(new Date('2024-03-20T19:30:00')),
    location: 'Gasthaus "Zur Linde", Göttingen',
    description: 'Gemütlicher Stammtisch für alle Ehemaligen zum Austausch und Networking.',
    isFeatured: false,
    createdAt: Timestamp.fromDate(new Date('2024-02-01'))
  },
  {
    id: 'event-3',
    title: 'Jubiläumsfeier 50 Jahre Hainberg',
    date: Timestamp.fromDate(new Date('2024-09-28T15:00:00')),
    location: 'Hainberg-Gymnasium, Schulhof',
    description: 'Große Feier zum 50-jährigen Bestehen unserer Schule mit Programm für die ganze Familie.',
    isFeatured: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-10'))
  },
  {
    id: 'event-4',
    title: 'Abitur-Reunion Jahrgang 2014',
    date: Timestamp.fromDate(new Date('2023-12-15T20:00:00')),
    location: 'Restaurant "Landgrafensaal"',
    description: '10-Jahres-Reunion des Abiturjahrgangs 2014 mit Dinner und Erinnerungen.',
    isFeatured: false,
    createdAt: Timestamp.fromDate(new Date('2023-11-01'))
  }
]

// Mock News Articles
export const getMockNews = (): NewsArticle[] => [
  {
    id: 'news-1',
    title: 'Neuer Schulleiter am Hainberg-Gymnasium',
    slug: 'neuer-schulleiter-hainberg-gymnasium',
    date: Timestamp.fromDate(new Date('2024-02-01')),
    excerpt: 'Dr. Martin Müller übernimmt die Leitung unserer ehemaligen Schule und stellt sich vor.',
    content: `Dr. Martin Müller hat zum neuen Schuljahr die Leitung des Hainberg-Gymnasiums übernommen. Der 45-jährige Pädagoge kommt vom Max-Planck-Gymnasium in Göttingen und bringt 15 Jahre Erfahrung in der Schulleitung mit.

In seinem ersten Interview betont Dr. Müller die Wichtigkeit der Verbindung zwischen der Schule und ihren ehemaligen Schülern: "Der Alumni-Verein ist ein wichtiger Partner für uns. Die Erfahrungen und das Netzwerk unserer Ehemaligen sind unbezahlbar für die aktuelle Schülerschaft."

Geplant sind verschiedene Projekte zur Stärkung dieser Verbindung, darunter Mentoring-Programme und regelmäßige Berufsorientierungsveranstaltungen mit Alumni als Referenten.`,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    tags: ['Schule', 'Leitung', 'Neuigkeiten'],
    createdAt: Timestamp.fromDate(new Date('2024-02-01'))
  },
  {
    id: 'news-2',
    title: 'Alumni-Stipendium 2024 ausgeschrieben',
    slug: 'alumni-stipendium-2024-ausgeschrieben',
    date: Timestamp.fromDate(new Date('2024-01-15')),
    excerpt: 'Auch in diesem Jahr vergibt der Alumni-Verein wieder Stipendien an besonders engagierte Schülerinnen und Schüler.',
    content: `Der Alumni-Verein des Hainberg-Gymnasiums schreibt auch für das Jahr 2024 wieder sein beliebtes Stipendienprogramm aus. Bis zu 5 Stipendien à 1.000 Euro werden an Schülerinnen und Schüler der Oberstufe vergeben.

Die Kriterien für die Vergabe sind:
- Besondere schulische Leistungen
- Soziales Engagement
- Bedürftigkeit
- Motivation und Zukunftspläne

Bewerbungen können bis zum 31. März 2024 eingereicht werden. Die Auswahl erfolgt durch eine Jury aus Alumni-Mitgliedern und Lehrkräften.

Interessierte Schülerinnen und Schüler finden alle Informationen und Bewerbungsunterlagen auf der Website der Schule.`,
    tags: ['Stipendium', 'Förderung', 'Bewerbung'],
    createdAt: Timestamp.fromDate(new Date('2024-01-15'))
  },
  {
    id: 'news-3',
    title: 'Erfolgreiche Karrieren unserer Alumni',
    slug: 'erfolgreiche-karrieren-alumni',
    date: Timestamp.fromDate(new Date('2023-12-10')),
    excerpt: 'Ein Überblick über die beeindruckenden Karrierewege einiger unserer ehemaligen Schülerinnen und Schüler.',
    content: `Der Alumni-Verein freut sich, über die beeindruckenden Karrierewege einiger unserer ehemaligen Schülerinnen und Schüler berichten zu können.

Dr. Sarah Weber (Abitur 2008) wurde kürzlich zur Professorin für Molekularbiologie an der Universität München berufen. Ihre Forschung zu neurodegenerativen Erkrankungen gilt als wegweisend.

Tom Richter (Abitur 2010) hat sein Startup für nachhaltige Technologien erfolgreich an einem führenden Technologiekonzern verkauft und investiert nun in junge Unternehmen.

Lisa Schmidt (Abitur 2012) arbeitet als Journalistin für eine renommierte Tageszeitung und wurde für ihre Reportagen über den Klimawandel mit dem Deutschen Journalistenpreis ausgezeichnet.

Diese Erfolgsgeschichten zeigen das Potenzial und die Vielfalt unserer Alumni-Gemeinschaft.`,
    coverUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    tags: ['Karriere', 'Erfolg', 'Portrait'],
    createdAt: Timestamp.fromDate(new Date('2023-12-10'))
  }
]

// Mock Gallery Images
export const getMockGallery = (): GalleryImage[] => [
  {
    id: 'img-1',
    title: 'Alumni-Jahrestreffen 2023',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-06-15'))
  },
  {
    id: 'img-2',
    title: 'Schulgebäude Hainberg-Gymnasium',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-09-01'))
  },
  {
    id: 'img-3',
    title: 'Abiturfeier 2023',
    imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3982bc2e4c4?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580846011-d3982bc2e4c4?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-07-10'))
  },
  {
    id: 'img-4',
    title: 'Stammtisch im Gasthaus',
    imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-11-20'))
  },
  {
    id: 'img-5',
    title: 'Sportfest 2023',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-05-30'))
  },
  {
    id: 'img-6',
    title: 'Alumni-Networking Event',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=225&fit=crop',
    createdAt: Timestamp.fromDate(new Date('2023-10-15'))
  }
]

// Mock Membership Applications
export const getMockMembershipApplications = (): MembershipApplication[] => [
  {
    id: 'app-1',
    name: 'Anna Mueller',
    email: 'anna.mueller@email.com',
    graduationYear: 2020,
    relation: 'Ehemalige Schülerin',
    message: 'Ich würde gerne dem Alumni-Verein beitreten und mich aktiv einbringen.',
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2024-02-10'))
  },
  {
    id: 'app-2',
    name: 'Dr. Michael Schmidt',
    email: 'm.schmidt@university.de',
    graduationYear: 1995,
    relation: 'Ehemaliger Schüler',
    message: 'Als Professor möchte ich gerne meine Expertise für Berufsorientierung zur Verfügung stellen.',
    status: 'approved',
    createdAt: Timestamp.fromDate(new Date('2024-01-25'))
  },
  {
    id: 'app-3',
    name: 'Sarah Weber',
    email: 'sarah.weber@company.com',
    graduationYear: 2018,
    relation: 'Ehemalige Schülerin',
    message: 'Ich arbeite jetzt in der Finanzbranche und würde gerne Praktikumsplätze anbieten.',
    status: 'pending',
    createdAt: Timestamp.fromDate(new Date('2024-02-05'))
  },
  {
    id: 'app-4',
    name: 'Thomas Becker',
    relation: 'Ehemaliger Lehrer',
    email: 'thomas.becker@retired.de',
    message: 'Als ehemaliger Lehrer des Hainberg-Gymnasiums möchte ich die Verbindung zur Schule aufrechterhalten.',
    status: 'approved',
    createdAt: Timestamp.fromDate(new Date('2024-01-15'))
  },
  {
    id: 'app-5',
    name: 'Lisa Hoffmann',
    email: 'lisa.hoffmann@email.com',
    graduationYear: 2022,
    relation: 'Ehemalige Schülerin',
    message: 'Ich studiere jetzt Medizin und möchte anderen Schülern bei der Studienwahl helfen.',
    status: 'rejected',
    createdAt: Timestamp.fromDate(new Date('2024-01-30'))
  }
]
