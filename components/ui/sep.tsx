/**
 * Middot separator with explicit spacing (Instrument Sans has a narrow word space).
 * <wbr> gives the line a break opportunity after each separator.
 */
export function Sep() {
  return (
    <>
      <span aria-hidden className="mx-1.5 text-muted">
        ·
      </span>
      <wbr />
    </>
  );
}
