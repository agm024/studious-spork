import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Globe2, ShoppingBag } from "lucide-react";

export default function About() {
  return (
    <section className="container-pad py-10">
      <Helmet>
        <title>Gruhaved Organic Food And Agro Products | About</title>
        <meta
          name="description"
          content="Learn about Gruhaved Organic Food And Agro Products."
        />
      </Helmet>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-3xl font-bold">About Gruhaved</h1>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Gruhaved Organic Food And Agro Products is built to connect households with dependable food and agro essentials.
          We focus on quality-sourced groceries, pantry staples, and everyday farm-linked products so families can shop
          confidently in one place. Our goal is simple: better produce, transparent sourcing, and reliable service.
        </p>


        <div className="grid md:grid-cols-3 gap-4 mt-7">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <ShoppingBag className="w-5 h-5 mb-2 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold">Curated Food Catalog</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Smartly organized categories for produce, staples, and household essentials.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <ShieldCheck className="w-5 h-5 mb-2 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold">Quality And Safety</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Trusted sourcing, freshness checks, and secure ordering for peace of mind.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <Globe2 className="w-5 h-5 mb-2 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold">Reliable Fulfillment</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Timely local delivery to keep your kitchen and business stocked.
            </p>
          </div>
        </div>

        <Link
          to="/contact"
          className="inline-block mt-7 px-5 py-3 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        >
          Contact Our Team
        </Link>
      </div>
    </section>
  );
}