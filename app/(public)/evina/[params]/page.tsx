import { getSubscriptionBySession } from "@/actions/evina-actions/evinaActions";
import { SubscriptionPage } from "@/components/evina-components/SubscriptionPage";

interface Props {
  params: Promise<{ params: string }>;
}

const EvinaSessionPage = async ({ params }: Props) => {
  const { params: sessionId } = await params;

  let sessionData = null;
  let sessionError = "";

  try {
    const res: any = await getSubscriptionBySession(sessionId);
    if (res?.data) {
      sessionData = res.data;
    } else if (res?.message) {
      sessionError = res.message;
    } else if (res?.error) {
      sessionError = res.error;
    }
  } catch (error) {
    sessionError = "Failed to load session";
  }

  return (
    <div>
      <SubscriptionPage sessionData={sessionData} sessionError={sessionError} />
    </div>
  );
};

export default EvinaSessionPage;
