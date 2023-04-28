import { ref } from "vue";

interface Alert {
    active: boolean;
    message: string;
}

export function alertOff() {
	alertController.value.active = false;
    alertController.value.message = "";
}

export function alertOn(message: string) {
	alertController.value.active = true;
    alertController.value.message = message;
}

export const alertController = ref<Alert>({ active: false, message: "" });
