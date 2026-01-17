'use client';

import { useTenant } from '../contexts/TenantContext';

interface FeatureGateProps {
    feature: 'gamification' | 'whatsapp' | 'finance' | 'pro_reports';
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const PLANS = {
    basic: [],
    pro: ['finance', 'whatsapp', 'pro_reports'],
    war: ['finance', 'whatsapp', 'pro_reports', 'gamification']
};

export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
    const { tenant, isLoading } = useTenant();

    if (isLoading) return null;
    if (!tenant) return null;

    const currentPlan = tenant.plan_tier || 'basic';
    const allowed = PLANS[currentPlan].includes(feature);

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
