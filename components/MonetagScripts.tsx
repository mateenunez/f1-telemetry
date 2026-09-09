"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import { isAdFreeRole, getTokenRoleId, isTokenExpired } from "@/utils/user";

const monetagScripts = [
  { zone: "277522", src: "https://quge5.com/88/tag.min.js" },
  { zone: "11654017", src: "https://nap5k.com/tag.min.js" },
  { zone: "11654025", src: "https://n6wxm.com/vignette.min.js" },
];

function removeMonetagArtifacts() {
  // Remove all ad script tags
  const scripts = document.querySelectorAll(
    'script[data-monetag-zone], script[data-zone="277522"], script[src*="quge5.com"], script[src*="nap5k.com"], script[src*="n6wxm.com"]',
  );
  scripts.forEach((el) => el.remove());

  // Clean up any active Monetag popups/vignettes/iframes if present
  const adNodes = document.querySelectorAll(
    '[id*="monetag"], [class*="monetag"], [data-zone="277522"], [data-zone="11654017"], [data-zone="11654025"]',
  );
  adNodes.forEach((el) => {
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
      document.body.appendChild(script);
    }
  }, [user, isAuthenticated]);

  return null;
}