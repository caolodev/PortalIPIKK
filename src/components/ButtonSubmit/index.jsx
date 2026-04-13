export default function ButtonSubmit({ submitting, title }) {
  return (
    <button type="submit" className="button-submit disabled:opacity-70" disabled={submitting}>
      {submitting ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        title
      )}
    </button>
  );
}
