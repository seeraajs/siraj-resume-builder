export interface CustomField {
  label: string;
  value: string;
}

export interface ResumeDraft {
  id: string;
  title: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  profilePhoto?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  customFields?: CustomField[];
  deletedFields?: string[];
  
  experiences: { id: string; company: string; position: string; duration: string; details: string; page?: number; }[];
  education: { id: string; school: string; degree: string; duration: string; page?: number; }[];
  skills: string[];
  projects?: { id: string; title: string; role: string; duration: string; details: string; page?: number; }[];
  certifications?: { id: string; title: string; issuer: string; date: string; page?: number; }[];
  trainings?: { id: string; title: string; provider: string; date: string; details?: string; page?: number; }[];
  languages?: { id: string; name: string; proficiency: string; page?: number; }[];
  references?: { id: string; name: string; organization: string; contact: string; page?: number; }[];
  socialLinks?: { id: string; platform: string; url: string; }[];
  coverLetter?: string;
  templateId?: number;
  sectionPages?: Record<string, number>;
  clSenderName?: string;
  clSenderAddress?: string;
  clEmail?: string;
  clPhone?: string;
  clDate?: string;
  clRecipientName?: string;
  clCompanyName?: string;
  clPositionTitle?: string;
  clSubject?: string;
  clGreeting?: string;
  clBody?: string;
  clClosing?: string;
  clSignature?: string;
  pagesCount?: number;
  colorTheme?: string;
  fontPack?: 'sans' | 'serif' | 'mono';
  textDirection?: 'ltr' | 'rtl';
  previewMode?: 'light' | 'dark';
  lastSaved: string;
}

export interface OfflineEmail {
  id?: string;
  recipientEmail: string;
  subject: string;
  messageText: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  pdfBlob?: string; // Base64 representation of PDF for dynamic dispatching
  resumeTitle?: string;
  timestamp: number;
}

const DB_NAME = 'resume-builder-pwa-db';
const DB_VERSION = 2;
const RESUMES_STORE = 'resumes';
const EMAILS_STORE = 'offline_emails';

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available on the client side.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      
      // Store 1: Resume drafts
      if (!db.objectStoreNames.contains(RESUMES_STORE)) {
        db.createObjectStore(RESUMES_STORE, { keyPath: 'id' });
      }

      // Store 2: Offline email queue
      if (!db.objectStoreNames.contains(EMAILS_STORE)) {
        db.createObjectStore(EMAILS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// RESUME ACTIONS
export async function getAllResumes(): Promise<ResumeDraft[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUMES_STORE, 'readonly');
    const store = transaction.objectStore(RESUMES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveResumeToDB(resume: ResumeDraft): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUMES_STORE, 'readwrite');
    const store = transaction.objectStore(RESUMES_STORE);
    const request = store.put(resume);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteResumeFromDB(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUMES_STORE, 'readwrite');
    const store = transaction.objectStore(RESUMES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveAllResumesToDB(resumes: ResumeDraft[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(RESUMES_STORE, 'readwrite');
    const store = transaction.objectStore(RESUMES_STORE);
    
    // Clear old store data before saving all (ensuring 1-1 sync)
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      if (resumes.length === 0) {
        resolve();
        return;
      }

      let count = 0;
      let failed = false;

      resumes.forEach((resume) => {
        const putRequest = store.put(resume);
        putRequest.onsuccess = () => {
          count++;
          if (count === resumes.length && !failed) {
            resolve();
          }
        };
        putRequest.onerror = () => {
          failed = true;
          reject(putRequest.error);
        };
      });
    };

    clearRequest.onerror = () => {
      reject(clearRequest.error);
    };
  });
}

// OFFLINE EMAIL QUEUE ACTIONS
export async function getQueuedEmails(): Promise<OfflineEmail[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EMAILS_STORE, 'readonly');
    const store = transaction.objectStore(EMAILS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function queueOfflineEmail(email: OfflineEmail): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EMAILS_STORE, 'readwrite');
    const store = transaction.objectStore(EMAILS_STORE);
    const request = store.put(email);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function removeQueuedEmail(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EMAILS_STORE, 'readwrite');
    const store = transaction.objectStore(EMAILS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearEmailQueue(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EMAILS_STORE, 'readwrite');
    const store = transaction.objectStore(EMAILS_STORE);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
