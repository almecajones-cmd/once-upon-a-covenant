"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

export default function Gateway() {
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    setEntered(sessionStorage.getItem("ouc-entered") === "1");
  }, []);

  function enter() {
    sessionStorage.setItem("ouc-entered", "1");
    track("gateway_enter");
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
        <div className="gatewayCrown" aria-hidden="true">
          <svg viewBox="0 0 120 82" role="presentation">
            <path d="M16 61 9 28l25 17 10-31 16 27 16-27 10 31 25-17-7 33H16Z" />
            <path d="M18 64h84l-5 10H23l-5-10Z" />
            <circle cx="9" cy="25" r="4" />
            <circle cx="44" cy="11" r="4" />
            <circle cx="60" cy="6" r="4" />
            <circle cx="76" cy="11" r="4" />
            <circle cx="111" cy="25" r="4" />
          </svg>
        </div>

        <div className="gatewayFlourish gatewayFlourish--top" aria-hidden="true">
          <span className="gatewayFlourishLine" />
          <span className="gatewayHeart">♡</span>
          <span className="gatewayFlourishLine" />
        </div>

        <h1 className="gatewayTitle">
          <span className="gatewayTitleTop">Once Upon A</span>
          <span className="gatewayTitleMain">Covenant</span>
        </h1>

        <p className="tagline">A Love Story Written by God</p>

        <div className="gatewayFlourish" aria-hidden="true">
          <span className="gatewayFlourishLine gatewayFlourishLine--short" />
          <span className="gatewayHeart">♡</span>
          <span className="gatewayFlourishLine gatewayFlourishLine--short" />
        </div>

        <blockquote>
          “A cord of three strands<br />is not quickly broken.”
          <span>ECCLESIASTES 4:12</span>
        </blockquote>

        <div className="gatewayFlourish gatewayFlourish--small" aria-hidden="true">
          <span className="gatewayFlourishLine gatewayFlourishLine--tiny" />
          <span className="gatewayHeart">♡</span>
          <span className="gatewayFlourishLine gatewayFlourishLine--tiny" />
        </div>

        <p className="date">OCTOBER 8–10, 2027</p>

        <button className="gatewayEnter" onClick={enter}>
          <span className="gatewayEnterMain">ENTER</span>
          <span className="gatewayEnterSub">YOUR INVITATION AWAITS</span>
        </button>
      </div>
    </section>
  );
}
