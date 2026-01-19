import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

let app: App

// Verificar que las credenciales estén configuradas
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Firebase no está configurado. Por favor configura las variables de entorno:')
    console.error('   - FIREBASE_PROJECT_ID')
    console.error('   - FIREBASE_PRIVATE_KEY')
    console.error('   - FIREBASE_CLIENT_EMAIL')
  }
}

// Inicializar Firebase Admin
if (getApps().length === 0) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    })
  } catch (error) {
    console.error('Error al inicializar Firebase:', error)
    throw error
  }
} else {
  app = getApps()[0]
}

export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
