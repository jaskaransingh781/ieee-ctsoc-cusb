import Button from './Button';

/**
 * Invitation to contact the chapter about getting involved.
 * `as` selects the heading level for the page section that contains it.
 */
export default function ChapterJoin({ as: Heading = 'h2', id = 'join' }) {
  return (
    <div className="cjoin" id={id}>
      <div className="cjoin__head">
        <Heading className={Heading === 'h1' ? 'h1' : 'h2'} id={`${id}-title`}>
          Want to be a part of the IEEE CTSoc CUSB Chapter?
        </Heading>
        <p className="lead">
          Interested in being part of our chapter? Sign up and our team will reach out to you with the next steps.
        </p>
      </div>
      <Button to="/signup" icon="arrow">
        Sign up
      </Button>
    </div>
  );
}
