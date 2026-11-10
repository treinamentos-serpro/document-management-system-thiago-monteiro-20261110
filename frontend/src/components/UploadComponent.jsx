import { useRef, useState } from 'react';

export default function UploadComponent({ isUploading, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile || isUploading) {
      return;
    }

    const uploaded = await onUpload(selectedFile);
    if (uploaded) {
      setSelectedFile(null);
      inputRef.current.value = '';
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-copy">
        <p className="eyebrow">ADICIONAR</p>
        <h2 id="upload-heading">Envie um documento</h2>
        <p>Os arquivos ficam armazenados localmente.</p>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-picker">
          <span>{selectedFile ? selectedFile.name : 'Escolher arquivo'}</span>
          <input
            ref={inputRef}
            type="file"
            required
            disabled={isUploading}
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />
        </label>
        <button className="button button-primary" type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}