"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import { isAdFreeRole, getTokenRoleId, isTokenExpired } from "@/utils/user";

const monetagScripts = [
  { zone: "11654017", src: "https://nap5k.com/tag.min.js" },
];

function removeMonetagArtifacts() {
  // Selectores dinámicos basados en la lista de monetagScripts
  const scriptSelectors = [
    'script[data-monetag-zone]',
    ...monetagScripts.flatMap(({ zone, src }) => [
      `script[data-zone="${zone}"]`,
      `script[src="${src}"]`,
    ]),
  ];

  document
    .querySelectorAll(scriptSelectors.join(", "))
    .forEach((el) => el.remove());

  // Limpiar nodos/banners/popups generados en el DOM por Monetag
  const adNodeSelectors = [
    '[id*="monetag"]',
    '[class*="monetag"]',
    ...monetagScripts.map(({ zone }) => `[data-zone="${zone}"]`),
  ];

  document
    .querySelectorAll(adNodeSelectors.join(", "))
    .forEach((el) => {
      if (el.tagName !== "SCRIPT") {
        el.remove();
      }
    });
}

export default function MonetagScripts() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if current user is ad-free based on user state (role id 2 = premium, id 3 = admin)
    let adFree = false;

    if (isAuthenticated && user?.role) {
      adFree = isAdFreeRole(user.role);
    } else {
      // Immediate cookie check so premium/admin users never see a flash of ads while user state is initializing
      const storedToken = Cookies.get("f1t_auth");
      if (storedToken && !isTokenExpired(storedToken)) {
        const roleId = getTokenRoleId(storedToken);
        if (roleId != null && isAdFreeRole(roleId)) {
          adFree = true;
        }
      }
    }

    if (adFree) {
      removeMonetagArtifacts();
      return;
    }

    // Load Monetag ad scripts for guest or base users (role id 1)
    for (const { zone, src } of monetagScripts) {
      if (
        document.querySelector(
          `script[data-monetag-zone="${zone}"], script[data-zone="${zone}"]`,
        )
      ) {
        continue;
      }

      const script = document.createElement("script");
      script.dataset.monetagZone = zone;
      script.dataset.zone = zone;
      script.setAttribute("data-cfasync", "false");
      script.src = src;
      script.async = true;
      const target = document.body || document.documentElement;
      target?.appendChild(script);
    }
  }, [user, isAuthenticated]);

  return null;
}
