import { useState } from "react";

export default function SidebarRight() {
  const [solutions, setSolutions] = useState([]);

  const handleSolution = (answer) => {
    setSolutions((prev) =>
      prev.includes(answer)
        ? prev.filter((item) => item !== answer)
        : [...prev, answer]
    );
  };

  return (
    <div>
      <form>
        <button type="reset">Reset</button>
        <br />

        <input
          type="checkbox"
          className="number-solution"
          value={1}
          checked={solutions.includes(1)}
          onChange={() => handleSolution(1)}
        />
        1
        <br />

        <input
          type="checkbox"
          className="number-solution"
          value={2}
          checked={solutions.includes(2)}
          onChange={() => handleSolution(2)}
        />
        2
        <br />

        <input
          type="checkbox"
          className="number-solution"
          value={3}
          checked={solutions.includes(3)}
          onChange={() => handleSolution(3)}
        />
        3
        <br />

        <input
          type="checkbox"
          className="number-solution"
          value={4}
          checked={solutions.includes(4)}
          onChange={() => handleSolution(4)}
        />
        4
        <br />

        <button type="submit">Valider</button>
      </form>
    </div>
  );
}