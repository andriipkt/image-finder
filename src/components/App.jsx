import { useEffect, useState } from 'react';
import Notiflix from 'notiflix';

import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Loader from './Loader/Loader';
import Modal from './Modal/Modal';
import fetchAPI from '../API-service/API-service';

export const App = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [loadMore, setLoadMore] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchImages = async () => {
      setIsLoading(true);

      try {
        const response = await fetchAPI(query, page);
        const { hits, totalHits } = response.data;

        if (hits.length === 0) {
          return Notiflix.Notify.failure('Нічого не знайдемо за Вашим запитом');
        }

        setImages(prevImages => [...prevImages, ...hits]);
        setError(null);
        setLoadMore(page < Math.ceil(totalHits / 12));
      } catch (error) {
        console.error(error);
        setError('Помилка при завантаженні зображень.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [query, page]);

  const loadMoreImages = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSubmit = searchQuery => {
    if (searchQuery === query) {
      return Notiflix.Notify.warning('Будь-ласка, введіть інший запит!');
    }
    setImages([]);
    setPage(1);
    setQuery(searchQuery);
  };

  const openModal = (largeImageURL, tags) => {
    setShowModal(true);
    setModalImage({ largeImageURL, tags });
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  return (
    <div className="App">
      <Searchbar onSubmit={handleSubmit} />
      {error && <h2>{error}</h2>}

      <ImageGallery images={images} openModal={openModal} />

      {isLoading && <Loader />}

      {loadMore && images.length > 0 && !isLoading && (
        <Button onClick={loadMoreImages} />
      )}

      {showModal && <Modal image={modalImage} onClose={closeModal} />}
    </div>
  );
};
