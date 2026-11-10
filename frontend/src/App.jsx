import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { fetchDocuments, uploadDocument } from './services/documentsApi.js';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadDocuments() {
      try {
        const result = await fetchDocuments(controller.signal);
        setDocuments(result.data);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadDocuments();
    return () => controller.abort();
  }, []);

  async function refreshDocuments() {
    setIsLoading(true);
    setError('');

    try {
      const result = await fetchDocuments();
      setDocuments(result.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file) {
    setIsUploading(true);
    setError('');
    setNotice('');

    try {
      await uploadDocument(file);
      const result = await fetchDocuments();
      setDocuments(result.data);
      setNotice('Documento enviado com sucesso.');
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">DOCUMENTOS</p>
          <h1>Seu arquivo, em ordem.</h1>
        </div>
        <p className="document-count" aria-live="polite">
          {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
        </p>
      </header>

      <UploadComponent isUploading={isUploading} onUpload={handleUpload} />

      {error && <p className="notice notice-error" role="alert">{error}</p>}
      {notice && <p className="notice notice-success" role="status">{notice}</p>}

      <DocumentList
        documents={documents}
        isLoading={isLoading}
        onRefresh={refreshDocuments}
      />
    </main>
  );
}
