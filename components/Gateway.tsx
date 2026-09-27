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
    requestAnimationFrame(() =>
      document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })
    );
  }

  if (entered) return null;

  return (
    <section className="gateway" aria-label="Once Upon a Covenant entrance">
      <div className="gatewayShade" />
      <div className="gatewayContent">
        <p className="gatewayKicker">YOUR INVITATION AWAITS</p>

        <h1 className="gatewayTitle">
          <span className="gatewayTitleTop">Once Upon A</span>
          <span className="gatewayTitleMain">Covenant</span>
        </h1>

        <p className="tagline">A Love Story Written by God</p>

        <div className="gatewayRule" aria-hidden="true" />

        <blockquote>
          “A cord of three strands<br />is not quickly broken.”
          <span>ECCLESIASTES 4:12</span>
        </blockquote>

        <div className="gatewayRule gatewayRuleShort" aria-hidden="true" />

        <p className="date">OCTOBER 8–10, 2027</p>

        <button className="gatewayEnter" onClick={enter}>
          <span className="gatewayEnterMain">ENTER</span>
          <span className="gatewayEnterSub">YOUR INVITATION AWAITS</span>
        </button>
      </div>
    </section>
  );
}
