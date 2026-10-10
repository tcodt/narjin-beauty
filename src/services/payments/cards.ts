import api from "../../utils/api";
import {
  NumbersCard,
  CreateNumbersCardPayload,
  UpdateNumbersCardPayload,
  SalonCardsResponse,
  CardBusinessInfo,
} from "../../types/payments";

/* -------------------------------------------------------------------------- */
/*                              Normalizers                                   */
/* -------------------------------------------------------------------------- */

function normalizeBusinessInfo(raw: unknown): CardBusinessInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const id = typeof b.id === "number" ? b.id : Number(b.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    name: String(b.name ?? ""),
    random_code: String(b.random_code ?? ""),
    is_active: b.is_active !== false,
  };
}

function normalizeCard(raw: unknown): NumbersCard | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;

  const id = typeof c.id === "number" ? c.id : Number(c.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  let business: NumbersCard["business"] = null;
  if (typeof c.business === "string") {
    business = c.business;
  } else if (c.business && typeof c.business === "object") {
    business = normalizeBusinessInfo(c.business);
  }

  return {
    id,
    business,
    num_code: String(c.num_code ?? ""),
    name_bank: String(c.name_bank ?? ""),
    card_holder_name: String(c.card_holder_name ?? ""),
    description: typeof c.description === "string" ? c.description : "",
    status: c.status !== false,
  };
}

/** پشتیبانی از: array خام | { results } | { cards, business } */
function normalizeCards(data: unknown): NumbersCard[] {
  if (Array.isArray(data)) {
    return data.map(normalizeCard).filter(Boolean) as NumbersCard[];
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    // شکل جدید API مشتری
    if (Array.isArray(obj.cards)) {
      return obj.cards.map(normalizeCard).filter(Boolean) as NumbersCard[];
    }

    if (Array.isArray(obj.results)) {
      return obj.results.map(normalizeCard).filter(Boolean) as NumbersCard[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data.map(normalizeCard).filter(Boolean) as NumbersCard[];
    }
  }

  return [];
}

function parseSalonCardsResponse(data: unknown): SalonCardsResponse {
  if (Array.isArray(data)) {
    return { business: null, cards: normalizeCards(data) };
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    return {
      business: normalizeBusinessInfo(obj.business),
      cards: normalizeCards(data),
    };
  }

  return { business: null, cards: [] };
}

/* -------------------------------------------------------------------------- */
/*                           Owner CRUD                                       */
/* -------------------------------------------------------------------------- */

export const getMyCards = async (): Promise<NumbersCard[]> => {
  const { data } = await api.get("/payments/cards/number/");
  return normalizeCards(data);
};

export const getCard = async (id: number): Promise<NumbersCard> => {
  const { data } = await api.get(`/payments/cards/number/${id}/`);
  const card = normalizeCard(data);
  if (!card) throw new Error("کارت نامعتبر");
  return card;
};

export const createCard = async (
  payload: CreateNumbersCardPayload,
): Promise<NumbersCard> => {
  const body = {
    num_code: payload.num_code.trim(),
    name_bank: payload.name_bank.trim(),
    card_holder_name: payload.card_holder_name.trim(),
    description: payload.description?.trim() ?? "",
    status: payload.status ?? true,
  };
  const { data } = await api.post("/payments/cards/number/", body);
  const card = normalizeCard(data);
  if (!card) throw new Error("پاسخ ساخت کارت نامعتبر");
  return card;
};

export const updateCard = async (
  id: number,
  payload: UpdateNumbersCardPayload,
): Promise<NumbersCard> => {
  const body: Record<string, unknown> = {};
  if (payload.num_code !== undefined) body.num_code = payload.num_code.trim();
  if (payload.name_bank !== undefined)
    body.name_bank = payload.name_bank.trim();
  if (payload.card_holder_name !== undefined)
    body.card_holder_name = payload.card_holder_name.trim();
  if (payload.description !== undefined)
    body.description = payload.description.trim();
  if (payload.status !== undefined) body.status = payload.status;

  const { data } = await api.patch(`/payments/cards/number/${id}/`, body);
  const card = normalizeCard(data);
  if (!card) throw new Error("پاسخ ویرایش کارت نامعتبر");
  return card;
};

export const deleteCard = async (id: number): Promise<void> => {
  await api.delete(`/payments/cards/number/${id}/`);
};

/* -------------------------------------------------------------------------- */
/*                           Customer                                         */
/* -------------------------------------------------------------------------- */

/**
 * GET /payments/cards/number/user/{random_code}/
 * Response واقعی:
 * { business: {...}, cards: [...] }
 */
export const getSalonCards = async (
  randomCode: string,
): Promise<SalonCardsResponse> => {
  const code = randomCode.trim();
  if (!code) return { business: null, cards: [] };

  // 1) path
  try {
    const { data } = await api.get(
      `/payments/cards/number/user/${encodeURIComponent(code)}/`,
    );
    const parsed = parseSalonCardsResponse(data);
    if (parsed.cards.length > 0 || parsed.business) {
      return {
        ...parsed,
        cards: parsed.cards.filter((c) => c.status !== false),
      };
    }
  } catch {
    /* fallback */
  }

  // 2) query
  const { data } = await api.get("/payments/cards/number/user/", {
    params: { business_code: code },
  });
  const parsed = parseSalonCardsResponse(data);
  return {
    ...parsed,
    cards: parsed.cards.filter((c) => c.status !== false),
  };
};
