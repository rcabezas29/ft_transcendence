import { ref, type Ref } from "vue";
import type { Chat } from './interfaces/index';

export const currentChat: Ref<Chat | null> = ref<Chat | null>(null);