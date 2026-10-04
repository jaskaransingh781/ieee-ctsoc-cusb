import { registrationCopy as copy } from '../data/registration';
import ChapterForm from './ChapterForm';

/**
 * Heading plus the free chapter registration form. Used as a section of the
 * Membership page and as the whole of the Sign up page.
 *   as : 'h1' on its own page, 'h3' inside the Membership page
 */
export default function ChapterJoin({ as: Heading = 'h2', id = 'join' }) {
  return (
    <div className="cjoin" id={id}>
      <div className="cjoin__head">
        <p className="cjoin__tag">
          <strong>{copy.free.price}</strong> {copy.free.label}
        </p>
        <Heading className={Heading === 'h1' ? 'h1' : 'h2'} id={`${id}-title`}>
          {copy.title}
        </Heading>
        <p className="lead">{copy.subtitle}</p>
      </div>
      <ChapterForm />
    </div>
  );
}
