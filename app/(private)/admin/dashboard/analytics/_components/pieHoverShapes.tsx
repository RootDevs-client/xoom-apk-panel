"use client";

import { Sector } from "recharts";

/**
 * Hover shapes shared by the analytics donut charts.
 * Recharts v3 applies `activeShape` to the hovered sector and `inactiveShape`
 * to the rest, so the hovered slice grows while the others fade back.
 */

export function renderActiveShape(props: any) {
  const { outerRadius = 0, innerRadius = 0 } = props;

  return (
    <g>
      {/* soft halo behind the lifted slice */}
      <Sector
        {...props}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 10}
        opacity={0.25}
      />
      <Sector
        {...props}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
      />
    </g>
  );
}

export function renderInactiveShape(props: any) {
  return <Sector {...props} opacity={0.35} />;
}
