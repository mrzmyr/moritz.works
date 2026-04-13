import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { siteConfig } from "@/config/app";
import { ObfuscatedEmail } from "./obfuscated-email";

export const metadata: Metadata = {
  title: "Imprint",
  description: `Legal disclosure and imprint for ${siteConfig.name}.`,
  alternates: {
    canonical: `${siteConfig.url}/imprint`,
  },
};

export default function Page() {
  return (
    <>
      <Breadcrumb items={[{ label: "Imprint" }]} />

      <h1 className="text-2xl font-medium mb-8 dark:text-white">Imprint</h1>

      <div className="text-neutral-800 dark:text-neutral-200 leading-7 space-y-8">
        <section>
          <h2 className="font-medium dark:text-white mb-2">
            Information according to Section 5 TMG
          </h2>
          <p>
            Moritz Meyer
            <br />
            Stettiner Stra&szlig;e 41
            <br />
            35410 Hungen
          </p>
        </section>

        <section>
          <h2 className="font-medium dark:text-white mb-2">
            Represented by
          </h2>
          <p>Moritz Meyer</p>
        </section>

        <section>
          <h2 className="font-medium dark:text-white mb-2">Contact</h2>
          <p>
            Email: <ObfuscatedEmail />
          </p>
        </section>

        <section>
          <h2 className="font-medium dark:text-white mb-2">
            Liability for Content
          </h2>
          <p>
            The contents of our pages have been created with the utmost care.
            However, we cannot guarantee the accuracy, completeness, or
            timeliness of the content. As a service provider, we are responsible
            for our own content on these pages in accordance with Section 7(1)
            TMG. According to Sections 8 to 10 TMG, however, we are not
            obligated to monitor transmitted or stored third-party information or
            to investigate circumstances that indicate illegal activity.
            Obligations to remove or block the use of information under general
            law remain unaffected. However, liability in this regard is only
            possible from the time of knowledge of a specific infringement. Upon
            becoming aware of such violations, we will remove the content
            immediately.
          </p>
        </section>

        <section>
          <h2 className="font-medium dark:text-white mb-2">
            Liability for Links
          </h2>
          <p>
            Our website contains links to external third-party websites over
            whose content we have no control. Therefore, we cannot accept any
            liability for this external content. The respective provider or
            operator of the pages is always responsible for the content of the
            linked pages. The linked pages were checked for possible legal
            violations at the time of linking. Illegal content was not
            recognizable at the time of linking. However, permanent monitoring of
            the content of the linked pages is not reasonable without concrete
            evidence of a violation. Upon becoming aware of legal violations, we
            will remove such links immediately.
          </p>
        </section>

        <section>
          <h2 className="font-medium dark:text-white mb-2">Data Protection</h2>
          <p>
            The use of our website is generally possible without providing
            personal data. Insofar as personal data (such as name, address, or
            email addresses) is collected on our pages, this is always done on a
            voluntary basis as far as possible. This data will not be passed on
            to third parties without your express consent. We point out that data
            transmission over the Internet (e.g., communication by email) may
            have security gaps. Complete protection of data against access by
            third parties is not possible. The use of contact data published
            within the framework of the imprint obligation by third parties for
            sending unsolicited advertising and information materials is hereby
            expressly prohibited. The operators of this website expressly reserve
            the right to take legal action in the event of unsolicited
            advertising, such as spam emails.
          </p>
        </section>
      </div>
    </>
  );
}
