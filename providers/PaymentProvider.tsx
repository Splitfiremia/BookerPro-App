import { useState, useCallback, useMemo, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useAuth } from "./AuthProvider";
import { useAppointments } from "./AppointmentProvider";

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex" | "discover" | "paypal" | "applepay" | "googlepay" | "cash";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  cardholderName?: string;
  brand?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  subtotal: number;
  amount: number;
  tipAmount?: number;
  tipPercentage?: number;
  tipType?: "percentage" | "custom" | "none";
  clientId?: string;
  providerId?: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  paymentMethodType?: "card" | "applepay" | "googlepay" | "cash";
  transactionId?: string;
  receiptUrl?: string;
  gratuityTracking?: {
    taxYear: number;
    reportedAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayoutSettings {
  schedule: "daily" | "weekly" | "monthly" | "instant";
  accountType: "bank" | "paypal" | "venmo";
  accountDetails: {
    accountNumber?: string;
    routingNumber?: string;
    email?: string;
    phone?: string;
    bankName?: string;
    accountHolderName?: string;
  };
  instantPayoutFee: number;
  minimumPayout: number;
  nextPayoutDate?: string;
}

export interface Payout {
  id: string;
  providerId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "pending" | "processing" | "completed" | "failed";
  payoutMethod: "bank" | "paypal" | "venmo" | "instant";
  scheduledDate: string;
  processedDate?: string;
  transactionId?: string;
  paymentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  completedPayouts: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  averageTransactionAmount: number;
  totalTips: number;
  serviceRevenue: number;
}

export interface TipSettings {
  providerId: string;
  preferredPercentages: number[];
  allowCustomTip: boolean;
  allowNoTip: boolean;
  defaultPercentage?: number;
  thankYouMessage?: string;
  splitTipEnabled: boolean;
}

export const [PaymentProvider, usePayments] = createContextHook(() => {
  const { user, isDeveloperMode } = useAuth();
  const { appointments, updateAppointment } = useAppointments();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [tipSettings, setTipSettings] = useState<TipSettings[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadPaymentData = async () => {
      console.log("[PaymentProvider] loadPaymentData start");
      setIsLoading(true);
      try {
        if (!user) return;

        if (isDeveloperMode) {
          if (user.role === "client") {
            const mockPaymentMethods = user.mockData?.paymentMethods || [
              {
                id: "pm1",
                type: "visa" as const,
                last4: "4242",
                expiryMonth: 12,
                expiryYear: 2025,
                isDefault: true,
                cardholderName: "John Doe",
                brand: "Visa",
              },
              {
                id: "pm2",
                type: "applepay" as const,
                isDefault: false,
              },
              {
                id: "pm3",
                type: "googlepay" as const,
                isDefault: false,
              },
              {
                id: "pm4",
                type: "cash" as const,
                isDefault: false,
              },
            ];
            setPaymentMethods(mockPaymentMethods);
          } else if (user.role === "stylist" || user.role === "owner") {
            setPayoutSettings({
              schedule: "weekly",
              accountType: "bank",
              accountDetails: {
                accountNumber: "XXXX4567",
                routingNumber: "XXXX8901",
                bankName: "Chase Bank",
                accountHolderName: user.name,
              },
              instantPayoutFee: 1.5,
              minimumPayout: 25,
              nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
            
            // Mock payouts for demo
            const mockPayouts: Payout[] = [
              {
                id: "payout-1",
                providerId: user.id || "provider-1",
                amount: 450.00,
                fee: 0,
                netAmount: 450.00,
                status: "completed",
                payoutMethod: "bank",
                scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                processedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                transactionId: "tx-payout-001",
                paymentIds: ["payment-1", "payment-2"],
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: "payout-2",
                providerId: user.id || "provider-1",
                amount: 320.00,
                fee: 4.80,
                netAmount: 315.20,
                status: "processing",
                payoutMethod: "instant",
                scheduledDate: new Date().toISOString(),
                paymentIds: ["payment-3"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
            setPayouts(mockPayouts);
            
            const mockTipSettings: TipSettings = {
              providerId: user.id || "provider-1",
              preferredPercentages: [15, 18, 20, 25],
              allowCustomTip: true,
              allowNoTip: true,
              defaultPercentage: 18,
              thankYouMessage: "Thank you for your generous tip! 🙏",
              splitTipEnabled: true,
            };
            setTipSettings([mockTipSettings]);
          }
          setPayments([]);
        } else {
          const storedPaymentMethods = await AsyncStorage.getItem(`paymentMethods_${user.id}`);
          if (storedPaymentMethods) {
            setPaymentMethods(JSON.parse(storedPaymentMethods));
          }
          const storedPayoutSettings = await AsyncStorage.getItem(`payoutSettings_${user.id}`);
          if (storedPayoutSettings) {
            setPayoutSettings(JSON.parse(storedPayoutSettings));
          }
          const storedPayments = await AsyncStorage.getItem(`payments_${user.id}`);
          if (storedPayments) {
            setPayments(JSON.parse(storedPayments));
          }
          
          const storedTipSettings = await AsyncStorage.getItem(`tipSettings_${user.id}`);
          if (storedTipSettings) {
            setTipSettings(JSON.parse(storedTipSettings));
          }
          
          const storedPayouts = await AsyncStorage.getItem(`payouts_${user.id}`);
          if (storedPayouts) {
            setPayouts(JSON.parse(storedPayouts));
          }
        }
      } catch (error) {
        console.error("[PaymentProvider] Error loading payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, [user, isDeveloperMode]);

  const persistPayments = useCallback(
    async (updated: Payment[]) => {
      console.log("[PaymentProvider] persistPayments", updated.length);
      setPayments(updated);
      if (!isDeveloperMode && user?.id) {
        await AsyncStorage.setItem(`payments_${user.id}`, JSON.stringify(updated));
      }
    },
    [isDeveloperMode, user?.id]
  );

  const requestPaymentForAppointment = useCallback(
    async (
      appointmentId: string,
      opts?: { clientId?: string; totalServiceCost?: number }
    ) => {
      console.log("[PaymentProvider] requestPaymentForAppointment", appointmentId);
      try {
        const existing = payments.find((p) => p.appointmentId === appointmentId);
        if (existing) return existing;
        const apt = appointments.find((a) => a.id === appointmentId);
        if (!apt) throw new Error("Appointment not found");
        const subtotal = opts?.totalServiceCost ?? (apt.totalAmount ?? apt.price ?? 0);
        const newPayment: Payment = {
          id: `payment-${Date.now()}`,
          appointmentId,
          subtotal,
          amount: subtotal,
          tipAmount: 0,
          tipPercentage: 0,
          tipType: "none",
          clientId: opts?.clientId ?? (user?.role === "client" ? user.id : undefined),
          providerId: apt.providerId || "provider-1",
          status: "pending",
          paymentMethodType: "card",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedPayments = [...payments, newPayment];
        await persistPayments(updatedPayments);
        return newPayment;
      } catch (error) {
        console.error("[PaymentProvider] Error requesting payment for appointment:", error);
        throw error;
      }
    },
    [appointments, payments, persistPayments, user?.id, user?.role]
  );

  useEffect(() => {
    const run = async () => {
      console.log("[PaymentProvider] observe appointments for completed status", appointments.length);
      try {
        const completed = appointments.filter((a) => a.status === "completed");
        for (const apt of completed) {
          const exists = payments.some((p) => p.appointmentId === apt.id);
          if (!exists) {
            await requestPaymentForAppointment(apt.id);
          }
        }
      } catch (e) {
        console.error("[PaymentProvider] Auto payment request error:", e);
      }
    };
    run();
  }, [appointments, payments, requestPaymentForAppointment]);

  const addPaymentMethod = useCallback(
    async (paymentMethod: Omit<PaymentMethod, "id">) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");

        const newPaymentMethod: PaymentMethod = {
          ...paymentMethod,
          id: `pm-${Date.now()}`,
        };

        let updatedPaymentMethods: PaymentMethod[];
        if (paymentMethod.isDefault || paymentMethods.length === 0) {
          updatedPaymentMethods = paymentMethods.map((pm) => ({
            ...pm,
            isDefault: false,
          }));
          updatedPaymentMethods.push(newPaymentMethod);
        } else {
          updatedPaymentMethods = [...paymentMethods, newPaymentMethod];
        }

        setPaymentMethods(updatedPaymentMethods);

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return newPaymentMethod;
      } catch (error) {
        console.error("[PaymentProvider] Error adding payment method:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const removePaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");

        const methodToRemove = paymentMethods.find((pm) => pm.id === paymentMethodId);
        if (!methodToRemove) throw new Error("Payment method not found");

        let updatedPaymentMethods = paymentMethods.filter((pm) => pm.id !== paymentMethodId);

        if (methodToRemove.isDefault && updatedPaymentMethods.length > 0) {
          updatedPaymentMethods = [
            { ...updatedPaymentMethods[0], isDefault: true },
            ...updatedPaymentMethods.slice(1),
          ];
        }

        setPaymentMethods(updatedPaymentMethods);

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return true;
      } catch (error) {
        console.error("[PaymentProvider] Error removing payment method:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const setDefaultPaymentMethod = useCallback(
    async (paymentMethodId: string) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");

        const updatedPaymentMethods = paymentMethods.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethodId,
        }));

        setPaymentMethods(updatedPaymentMethods);

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `paymentMethods_${user.id}`,
            JSON.stringify(updatedPaymentMethods)
          );
        }

        return updatedPaymentMethods.find((pm) => pm.id === paymentMethodId);
      } catch (error) {
        console.error("[PaymentProvider] Error setting default payment method:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [paymentMethods, user, isDeveloperMode]
  );

  const processPayment = useCallback(
    async (
      appointmentId: string,
      amount: number,
      tipAmount: number,
      paymentMethodId: string,
      tipType: "percentage" | "custom" | "none" = "none"
    ) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");

        const foundMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);
        const tipPercentage = Math.round((tipAmount / (amount || 1)) * 100);

        const existing = payments.find((p) => p.appointmentId === appointmentId);
        const base: Payment =
          existing ?? {
            id: `payment-${Date.now()}`,
            appointmentId,
            subtotal: amount,
            amount,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

        const pendingPayment: Payment = {
          ...base,
          subtotal: base.subtotal ?? (amount - tipAmount),
          amount,
          tipAmount,
          tipPercentage,
          tipType,
          status: "processing",
          paymentMethod: foundMethod?.id ?? paymentMethodId,
          paymentMethodType: foundMethod?.type === "applepay" ? "applepay" : 
                           foundMethod?.type === "googlepay" ? "googlepay" :
                           foundMethod?.type === "cash" ? "cash" : "card",
          gratuityTracking: tipAmount > 0 ? {
            taxYear: new Date().getFullYear(),
            reportedAmount: tipAmount,
          } : undefined,
          updatedAt: new Date().toISOString(),
        };

        const pendingUpdated = existing
          ? payments.map((p) => (p.id === existing.id ? pendingPayment : p))
          : [...payments, pendingPayment];
        await persistPayments(pendingUpdated);

        await new Promise((res) => setTimeout(res, 2000));

        const completedPayment: Payment = {
          ...pendingPayment,
          status: "completed",
          transactionId: `tx-${Date.now()}`,
          receiptUrl: `https://receipts.bookerpro.com/${pendingPayment.id}`,
          updatedAt: new Date().toISOString(),
        };

        const finalUpdated = existing
          ? pendingUpdated.map((p) => (p.id === (existing?.id ?? completedPayment.id) ? completedPayment : p))
          : pendingUpdated.map((p) => (p.id === completedPayment.id ? completedPayment : p));
        await persistPayments(finalUpdated);

        await updateAppointment(appointmentId, { status: "paid" });

        return completedPayment;
      } catch (error) {
        console.error("[PaymentProvider] Error processing payment:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [payments, paymentMethods, user, isDeveloperMode, persistPayments, updateAppointment]
  );

  const updatePayoutSettings = useCallback(
    async (settings: PayoutSettings) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot set payout settings");

        setPayoutSettings(settings);

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `payoutSettings_${user.id}`,
            JSON.stringify(settings)
          );
        }

        return settings;
      } catch (error) {
        console.error("[PaymentProvider] Error updating payout settings:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, isDeveloperMode]
  );

  const calculateTipSuggestions = useCallback((amount: number, providerId?: string) => {
    const providerTipSettings = tipSettings.find(ts => ts.providerId === providerId);
    const percentages = providerTipSettings?.preferredPercentages || [15, 18, 20, 25];
    
    return {
      suggestions: percentages.map(pct => ({
        percentage: pct,
        amount: Math.round(amount * (pct / 100)),
        label: `${pct}%`
      })),
      allowCustom: providerTipSettings?.allowCustomTip ?? true,
      allowNoTip: providerTipSettings?.allowNoTip ?? true,
      defaultPercentage: providerTipSettings?.defaultPercentage ?? 18,
      thankYouMessage: providerTipSettings?.thankYouMessage,
    };
  }, [tipSettings]);

  const updateTipSettings = useCallback(
    async (providerId: string, settings: Partial<TipSettings>) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot set tip settings");

        const existingIndex = tipSettings.findIndex(ts => ts.providerId === providerId);
        let updatedTipSettings: TipSettings[];
        
        if (existingIndex >= 0) {
          updatedTipSettings = tipSettings.map((ts, index) => 
            index === existingIndex ? { ...ts, ...settings } : ts
          );
        } else {
          const newTipSettings: TipSettings = {
            providerId,
            preferredPercentages: [15, 18, 20, 25],
            allowCustomTip: true,
            allowNoTip: true,
            splitTipEnabled: false,
            ...settings,
          };
          updatedTipSettings = [...tipSettings, newTipSettings];
        }

        setTipSettings(updatedTipSettings);

        if (!isDeveloperMode) {
          await AsyncStorage.setItem(
            `tipSettings_${user.id}`,
            JSON.stringify(updatedTipSettings)
          );
        }

        return updatedTipSettings.find(ts => ts.providerId === providerId);
      } catch (error) {
        console.error("[PaymentProvider] Error updating tip settings:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tipSettings, user, isDeveloperMode]
  );

  const calculateEarnings = useCallback((): EarningsData => {
    const completedPayments = payments.filter(p => p.status === "completed" && p.providerId === user?.id);
    const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTips = completedPayments.reduce((sum, p) => sum + (p.tipAmount || 0), 0);
    const serviceRevenue = totalEarnings - totalTips;
    
    const completedPayouts = payouts.filter(p => p.status === "completed" && p.providerId === user?.id);
    const pendingPayments = completedPayments.filter(p => 
      !payouts.some(payout => payout.paymentIds.includes(p.id) && payout.status === "completed")
    );
    const pendingEarnings = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekPayments = completedPayments.filter(p => new Date(p.createdAt) >= oneWeekAgo);
    const thisMonthPayments = completedPayments.filter(p => new Date(p.createdAt) >= oneMonthAgo);
    
    const thisWeekEarnings = thisWeekPayments.reduce((sum, p) => sum + p.amount, 0);
    const thisMonthEarnings = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalEarnings,
      pendingEarnings,
      completedPayouts: completedPayouts.reduce((sum, p) => sum + p.netAmount, 0),
      thisWeekEarnings,
      thisMonthEarnings,
      averageTransactionAmount: completedPayments.length > 0 ? totalEarnings / completedPayments.length : 0,
      totalTips,
      serviceRevenue,
    };
  }, [payments, payouts, user?.id]);

  const requestInstantPayout = useCallback(
    async (amount: number) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");
        if (user.role === "client") throw new Error("Clients cannot request payouts");
        if (!payoutSettings) throw new Error("Payout settings not configured");
        
        const fee = amount * (payoutSettings.instantPayoutFee / 100);
        const netAmount = amount - fee;
        
        if (amount < payoutSettings.minimumPayout) {
          throw new Error(`Minimum payout amount is ${payoutSettings.minimumPayout}`);
        }
        
        const pendingPayments = payments.filter(p => 
          p.status === "completed" && 
          p.providerId === user.id &&
          !payouts.some(payout => payout.paymentIds.includes(p.id))
        );
        
        const availableAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
        if (amount > availableAmount) {
          throw new Error("Insufficient available earnings");
        }
        
        const newPayout: Payout = {
          id: `payout-${Date.now()}`,
          providerId: user.id || "provider-1",
          amount,
          fee,
          netAmount,
          status: "processing",
          payoutMethod: "instant",
          scheduledDate: new Date().toISOString(),
          paymentIds: pendingPayments.slice(0, Math.ceil(pendingPayments.length * (amount / availableAmount))).map(p => p.id),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedPayouts = [...payouts, newPayout];
        setPayouts(updatedPayouts);
        
        if (!isDeveloperMode) {
          await AsyncStorage.setItem(`payouts_${user.id}`, JSON.stringify(updatedPayouts));
        }
        
        // Simulate processing time
        setTimeout(async () => {
          const completedPayout = {
            ...newPayout,
            status: "completed" as const,
            processedDate: new Date().toISOString(),
            transactionId: `tx-instant-${Date.now()}`,
            updatedAt: new Date().toISOString(),
          };
          
          const finalPayouts = updatedPayouts.map(p => p.id === newPayout.id ? completedPayout : p);
          setPayouts(finalPayouts);
          
          if (!isDeveloperMode) {
            await AsyncStorage.setItem(`payouts_${user.id}`, JSON.stringify(finalPayouts));
          }
        }, 3000);
        
        return newPayout;
      } catch (error) {
        console.error("[PaymentProvider] Error requesting instant payout:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, payoutSettings, payments, payouts, isDeveloperMode]
  );

  const getPayoutHistory = useCallback(() => {
    return payouts.filter(p => p.providerId === user?.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [payouts, user?.id]);

  const validatePaymentSecurity = useCallback(
    async (paymentData: any) => {
      // Mock PCI compliance validation
      console.log("[PaymentProvider] Validating payment security...");
      
      // Simulate fraud detection
      const fraudScore = Math.random();
      if (fraudScore > 0.95) {
        throw new Error("Transaction flagged for potential fraud");
      }
      
      // Simulate encryption
      const encryptedData = {
        ...paymentData,
        cardNumber: paymentData.cardNumber ? "****" + paymentData.cardNumber.slice(-4) : undefined,
        cvv: "***",
      };
      
      return {
        isValid: true,
        encryptedData,
        fraudScore,
        complianceCheck: "PCI-DSS Level 1",
      };
    },
    []
  );

  const splitTip = useCallback(
    async (paymentId: string, splits: { providerId: string; amount: number }[]) => {
      setIsLoading(true);
      try {
        if (!user) throw new Error("User not authenticated");
        
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) throw new Error("Payment not found");
        
        const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
        if (totalSplitAmount !== (payment.tipAmount || 0)) {
          throw new Error("Split amounts must equal total tip amount");
        }
        
        // Create individual tip records for each provider
        const splitPayments = splits.map(split => ({
          ...payment,
          id: `${payment.id}-split-${split.providerId}`,
          providerId: split.providerId,
          tipAmount: split.amount,
          amount: split.amount, // Only the tip portion for split records
          subtotal: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        const updatedPayments = [...payments, ...splitPayments];
        await persistPayments(updatedPayments);
        
        return splitPayments;
      } catch (error) {
        console.error("[PaymentProvider] Error splitting tip:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [payments, user, persistPayments]
  );

  const generateReceipt = useCallback(
    async (paymentId: string) => {
      try {
        const payment = payments.find(p => p.id === paymentId);
        if (!payment) throw new Error("Payment not found");
        
        const appointment = appointments.find(a => a.id === payment.appointmentId);
        if (!appointment) throw new Error("Appointment not found");
        
        // In a real app, this would generate and email a receipt
        const receiptData = {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          date: payment.updatedAt,
          subtotal: payment.subtotal,
          tip: payment.tipAmount || 0,
          total: payment.amount,
          paymentMethod: payment.paymentMethodType,
          service: appointment.serviceName || "Service",
          provider: appointment.providerName || "Provider",
        };
        
        console.log("[PaymentProvider] Receipt generated:", receiptData);
        return receiptData;
      } catch (error) {
        console.error("[PaymentProvider] Error generating receipt:", error);
        throw error;
      }
    },
    [payments, appointments]
  );

  return useMemo(
    () => ({
      paymentMethods,
      payments,
      payouts,
      payoutSettings,
      tipSettings,
      isLoading,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      processPayment,
      updatePayoutSettings,
      updateTipSettings,
      calculateTipSuggestions,
      requestPaymentForAppointment,
      splitTip,
      generateReceipt,
      calculateEarnings,
      requestInstantPayout,
      getPayoutHistory,
      validatePaymentSecurity,
    }),
    [
      paymentMethods,
      payments,
      payouts,
      payoutSettings,
      tipSettings,
      isLoading,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      processPayment,
      updatePayoutSettings,
      updateTipSettings,
      calculateTipSuggestions,
      requestPaymentForAppointment,
      splitTip,
      generateReceipt,
      calculateEarnings,
      requestInstantPayout,
      getPayoutHistory,
      validatePaymentSecurity,
    ]
  );
});