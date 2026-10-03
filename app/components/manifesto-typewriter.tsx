const manifestoText = "Te mostramos la puerta.\nDiseñamos el sistema.\nTú decides hasta dónde quieres llegar.";

export default function ManifestoTypewriter() {
  const [firstLine, secondLine, thirdLine] = manifestoText.split("\n");

  return (
    <h2 className="manifesto-terminal-heading">
      <span className="manifesto-typed">
        {firstLine}<br />{secondLine}<br /><em>{thirdLine}</em>
      </span>
    </h2>
  );
}
