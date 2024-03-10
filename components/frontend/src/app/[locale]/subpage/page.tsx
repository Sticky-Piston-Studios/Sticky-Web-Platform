import "@/styles/subpage.css";

import React from "react";
import { useServerTranslation } from "@/locale/i18n-server";

/* eslint-disable react-hooks/rules-of-hooks */
// --- Metadata setup ---
export async function generateMetadata({ params  }:{ params : { [key: string]: string } }) {
 const { t } = await useServerTranslation(params.locale, ["subpage"]);

 return {
  title: t("metadata.title"),
 }
}
/* eslint-enable react-hooks/rules-of-hooks */

export default async function Page({
  params: { locale },
}: {
  params: { locale: string };
}) {

  const { t } = await useServerTranslation(locale, ["common", "subpage"]);

  const html = (
    <main className="overflow-clip">
      <div className="basic-theme">

      <div className="container flex flex-col mx-auto px-8">

        <div className='flex flex-col h-[100vh] justify-center'>
          <h1>{t('other.hello_world')}</h1>
          <div className="h-[32px]"/>
          <p>{t("other.text")}</p>
        </div>
        
      </div>
      </div>
    </main>
  );

  return html;
}
