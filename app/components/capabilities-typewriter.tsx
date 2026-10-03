const titleText = "Lo que construimos.";
const descriptionText = "Diseñamos experiencias y sistemas conectados para negocios que ya están listos para evolucionar.";

export default function CapabilitiesTypewriter() {
  return (
    <>
      <h2 className="capability-typewriter-title">{titleText}</h2>
      <p className="capability-typewriter-copy">{descriptionText}</p>
    </>
  );
}
