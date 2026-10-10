import { useMemo, useState } from 'react';
import GalleryGrid from '../components/Gallery';
import { gallery } from '../data/gallery';
import { getEvent } from '../data/events';

export function GalleryArchive() {
  const [edition, setEdition] = useState('all');
  const editions = useMemo(() => [...new Set(gallery.map((photo) => photo.event))], []);
  const visible = edition === 'all' ? gallery : gallery.filter((photo) => photo.event === edition);

  return (
    <>
      <header className="container page-head gallery-page__head">
        <p className="eyebrow">FROM THE ARCHIVE</p>
        <h1 className="h1">Moments from the build.</h1>
        <p className="lead">A look back at teams, ideas and shared work across Zinnovatio editions.</p>
      </header>

      <section className="container gallery-page" aria-label="Photo archive">
        <div className="gallery-page__filters" role="group" aria-label="Filter photos by edition">
          <button type="button" className={edition === 'all' ? 'is-active' : ''} aria-pressed={edition === 'all'} onClick={() => setEdition('all')}>
            All photographs
          </button>
          {editions.map((slug) => (
            <button type="button" key={slug} className={edition === slug ? 'is-active' : ''} aria-pressed={edition === slug} onClick={() => setEdition(slug)}>
              {getEvent(slug)?.title ?? slug}
            </button>
          ))}
        </div>
        <GalleryGrid key={edition} photos={visible} title="Across the editions" note="Photographs from the Zinnovatio archive." />
      </section>
    </>
  );
}
