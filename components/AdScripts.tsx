"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import { isAdFreeRole, getTokenRoleId, isTokenExpired } from "@/utils/user";

const adProviderScripts = [
  {
    src: "https://czernik.org/21/998c1de9e63eea16e5398f510d811678",
    async: true,
  },
  { src: "https://czernik.org/14/e118ccb4d6c21624243d1f5cd6df7030" },
];

const adContainerId = "container-998c1de9e63eea16e5398f510d811678";

function removeAdArtifacts() {
  document
    .querySelectorAll('script[data-ad-provider-script]')
    .forEach((script) => script.remove());
  document.getElementById(adContainerId)?.replaceChildren();
}

export default function AdScripts() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let adFree = false;

    if (isAuthenticated && user?.role) {
      adFree = isAdFreeRole(user.role);
    } else {
      const storedToken = Cookies.get("f1t_auth");
      if (storedToken && !isTokenExpired(storedToken)) {
        const roleId = getTokenRoleId(storedToken);
        if (roleId != null && isAdFreeRole(roleId)) {
          adFree = true;
        }
      }
    }

    if (adFree) {
      removeAdArtifacts();
      return;
    }

    for (const { src, async: isAsync } of adProviderScripts) {
      if (document.querySelector(`script[data-ad-provider-script="${src}"]`)) {
        continue;
      }

      const script = document.createElement("script");
      script.dataset.adProviderScript = src;
      script.setAttribute("data-cfasync", "false");
      script.src = src;
      if (isAsync) script.async = true;
      const target = document.body || document.documentElement;
      target?.appendChild(script);
    }
  }, [user, isAuthenticated]);

  return <div id={adContainerId} />;
}
