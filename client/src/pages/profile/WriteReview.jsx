import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import WebsiteReviewForm from '../../components/review/WebsiteReviewForm';

// /account/review — the website review form lives here now that the storefront
// reviews band is read-only. The form itself is the same component (and the same
// API slice), so signing in and moderation work exactly as before.
export default function WriteReview() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Your feedback"
        title="Write a review"
        description="Tell other shoppers how browsing, sizing and checkout felt. Reviews are text only and appear on the homepage once an admin approves them."
      />

      <WebsiteReviewForm />
    </div>
  );
}
