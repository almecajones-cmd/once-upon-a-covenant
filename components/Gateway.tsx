"use client";

import { useEffect, useState } from "react";

export default function Gateway() {
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    setEntered(sessionStorage.getItem("ouc-entered") === "1");
  }, []);

  function enter() {
    sessionStorage.setItem("ouc-entered", "1");
    setEntered(true);
    requestAnimationFrame(() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" }));
  }

  if (entered) return null;

  return (
    <section className="gateway" aria-label="Once Upon a Covenant entrance">
      <div className="gatewayShade" />
      <div className="gatewayContent">
        <p className="eyebrow">YOUR INVITATION AWAITS</p>
        <h1>Once Upon a Covenant</h1>
        <p className="tagline">A Love Story Written by God</p>
        <p className="date">October 8–10, 2027</p>
        <blockquote>“A cord of three strands is not quickly broken.” <span>— Ecclesiastes 4:12</span></blockquote>
        <button className="goldButton" onClick={enter}>ENTER THE STORY</button>
      </div>
    </section>
  );
}
