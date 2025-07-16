import { useParams } from 'react-router-dom';

export default function Publicacion() {
  const { id } = useParams();

  return (
    <div className="container">
      <h1>Vista de publicación</h1>
      <p>ID: {id}</p>
    </div>
  );
}
