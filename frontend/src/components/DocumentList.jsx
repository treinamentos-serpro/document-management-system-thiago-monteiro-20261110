import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(size)} ${units[unitIndex]}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR');
}

export default function DocumentList({ documents, isLoading, onRefresh }) {
  return (
    <section className="documents-section" aria-labelledby="documents-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">BIBLIOTECA</p>
          <h2 id="documents-heading">Documentos enviados</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar lista'}
        </button>
      </div>

      {isLoading ? (
        <p className="list-message" role="status">Carregando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="list-message">Nenhum documento enviado ainda.</p>
      ) : (
        <div className="table-scroll">
          <table className="document-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tamanho</th>
                <th scope="col">Enviado em</th>
                <th scope="col"><span className="visually-hidden">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td className="document-name">{document.originalName}</td>
                  <td>{formatSize(document.size)}</td>
                  <td>{formatDate(document.uploadedAt)}</td>
                  <td className="document-action">
                    <DownloadButton document={document} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}