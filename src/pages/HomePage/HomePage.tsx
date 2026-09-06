import React, { useMemo } from "react";
import { getGreeting } from "../../utils/greetings";
import { Link, useNavigate } from "react-router";
import OfferCarousel from "../../components/OfferCarousel/OfferCarousel";
import CommentForm from "../../components/CommentForm/CommentForm";
import { useGetProfile } from "../../hooks/profile/useGetProfile";
import { useGetComments } from "../../hooks/comments/useGetComments";
import { ThemeColorName, useThemeColor } from "../../context/ThemeColor";
import { motion } from "framer-motion";
import { FaStar, FaMapMarkerAlt, FaPhone, FaStore } from "react-icons/fa";
import { LuCalendarClock } from "react-icons/lu";
import Dots from "../../components/Dots/Dots";
import { useJoinedBusiness } from "../../context/JoinedBusinessContext";
import { useUserType } from "../../context/UserTypeContext";
import { useGetServices } from "../../hooks/services/useGetServices";
import { useDisplayPackages } from "../../hooks/packages/useDisplayPackages";
import { filterByBusinessId } from "../../utils/filterByJoinedBusiness";
import Button from "../../components/Button/Button";
import { themeText } from "../../utils/themeClasses";

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  salon: "سالن زیبایی",
  barbershop: "آرایشگاه مردانه",
  spa: "اسپا",
  clinic: "کلینیک",
  gym: "باشگاه ورزشی",
};

const formatPrice = (price: string | number) => {
  if (price === undefined || price === null) return "۰";
  return new Intl.NumberFormat("fa-IR").format(Number(price));
};

const HomePage: React.FC = () => {
  const { data: userProfile } = useGetProfile();
  const greetingUser = getGreeting(userProfile?.first_name);
  const { themeColor } = useThemeColor();
  const navigate = useNavigate();
  const { userType } = useUserType();
  const { joinedBusiness, hasJoinedBusiness, isReady, clearJoinedBusiness } =
    useJoinedBusiness();

  const isCustomer = userType === "customer" || !userType;

  const { data: allServices = [], isLoading: servicesLoading } =
    useGetServices();
  const { data: allPackages = [], isLoading: packagesLoading } =
    useDisplayPackages();
  const { data: comments = [], isLoading: commentsLoading } = useGetComments();

  const businessId = joinedBusiness?.id ?? null;

  const services = useMemo(
    () => filterByBusinessId(allServices, businessId),
    [allServices, businessId],
  );

  const packages = useMemo(
    () => filterByBusinessId(allPackages, businessId),
    [allPackages, businessId],
  );

  const approvedComments = comments
    .filter((c) => c.rating >= 1 && c.rating <= 5)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  // Customer without salon code → force join
  if (isReady && isCustomer && !hasJoinedBusiness) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <FaStore className={`text-5xl text-${themeColor}-500`} />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          هنوز به سالنی متصل نیستید
        </h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-300">
          برای مشاهده خدمات و رزرو نوبت، کد اختصاصی سالن را وارد کنید.
        </p>
        <Button type="button" onClick={() => navigate("/random-code-input")}>
          ورود کد کسب‌وکار
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-8 pb-12">
      <motion.h3
        className="mt-4 text-2xl font-bold text-gray-800 dark:text-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {greetingUser}
      </motion.h3>

      {/* Joined salon card */}
      {joinedBusiness && (
        <motion.div
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-gray-800"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-400">سالن شما</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {joinedBusiness.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {BUSINESS_TYPE_LABELS[joinedBusiness.business_type] ||
                  joinedBusiness.business_type}
              </p>
            </div>
            <span
              className={`rounded-full bg-${themeColor}-50 px-3 py-1 text-xs font-semibold ${themeText[themeColor as ThemeColorName]} dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300`}
            >
              {joinedBusiness.random_code}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {joinedBusiness.address && (
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt className={`text-${themeColor}-500`} />
                {joinedBusiness.address}
              </p>
            )}
            {joinedBusiness.phone_number && (
              <p className="flex items-center gap-2">
                <FaPhone className={`text-${themeColor}-500`} />
                {joinedBusiness.phone_number}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => navigate("/reserve")}>
              رزرو نوبت
            </Button>
            <button
              type="button"
              onClick={() => {
                clearJoinedBusiness();
                navigate("/join-salon");
              }}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              تغییر سالن
            </button>
          </div>
        </motion.div>
      )}

      <OfferCarousel />

      {/* Reserve CTA */}
      <motion.div
        className={`rounded-2xl bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-700 p-6 text-white shadow-xl`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2">
          <LuCalendarClock size={28} />
          <h3 className="text-xl font-bold">
            رزرو نوبت در {joinedBusiness?.name}
          </h3>
        </div>
        <p className="mt-2 text-sm text-white/90">
          فقط خدمات و زمان‌های همین سالن برای شما نمایش داده می‌شود.
        </p>
        <Link
          to="/reserve"
          className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow hover:bg-gray-100"
        >
          شروع رزرو
        </Link>
      </motion.div>

      {/* Services of this salon only */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          خدمات سالن
        </h3>
        {servicesLoading ? (
          <div className="flex justify-center py-8">
            <Dots />
          </div>
        ) : services.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            هنوز خدمتی برای این سالن ثبت نشده است.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => navigate("/reserve")}
                className="rounded-xl border border-gray-100 bg-white p-4 text-right shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {service.name}
                </h4>
                {service.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                    {service.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {service.duration ? `${service.duration} دقیقه` : "—"}
                  </span>
                  <span
                    className={`font-bold ${themeText[themeColor as ThemeColorName]}`}
                  >
                    {formatPrice(service.price)} تومان
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Packages of this salon only */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
          پکیج‌ها
        </h3>
        {packagesLoading ? (
          <div className="flex justify-center py-8">
            <Dots />
          </div>
        ) : packages.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            پکیجی برای این سالن وجود ندارد.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                to={`/packages/${pkg.id}`}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <img
                  src={
                    pkg.image
                      ? `https://queuingprojectapi.pythonanywhere.com${pkg.image}`
                      : "/images/no-image.jpg"
                  }
                  alt={pkg.name}
                  className="h-32 w-full object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    {pkg.name}
                  </h4>
                  <p
                    className={`mt-1 text-sm font-bold ${themeText[themeColor as ThemeColorName]}`}
                  >
                    {formatPrice(pkg.total_price)} تومان
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="mt-8">
        <h3 className="mb-6 text-center text-xl font-bold text-gray-800 dark:text-white">
          نظرات مشتریان
        </h3>

        {userProfile && businessId && <CommentForm businessId={businessId} />}

        {commentsLoading ? (
          <div className="flex justify-center py-10">
            <Dots />
          </div>
        ) : approvedComments.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            هنوز نظری ثبت نشده است.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {approvedComments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={14}
                      className={
                        i < comment.rating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  «{comment.content}»
                </p>
                <p className="mt-3 text-left text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} تمامی حقوق محفوظ است.
        </p>
      </footer>
    </section>
  );
};

export default HomePage;
