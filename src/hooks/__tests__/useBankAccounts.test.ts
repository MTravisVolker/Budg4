import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { useBankAccounts } from '../useBankAccounts';

const mockedAxios = axios as unknown as ReturnType<typeof vi.fn>;

// ... existing code ... 