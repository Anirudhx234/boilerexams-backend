-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "bodyVector" tsvector;

CREATE FUNCTION question_vector_refresh() RETURNS TRIGGER AS $$
BEGIN
    NEW."bodyVector" := to_tsvector(NEW."data"->>'body');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_vector_trigger BEFORE INSERT OR UPDATE ON "Question"
    FOR EACH ROW EXECUTE FUNCTION question_vector_refresh();

-- Backfill all existing questions, ensuring data and data->>'body' are valid
UPDATE "Question"
SET "bodyVector" = to_tsvector("data"->>'body')
WHERE
    jsonb_typeof("data") = 'object' AND
    "data"->>'body' IS NOT NULL AND
    "data"->>'body' <> '';