<script setup lang="ts">
import router from '@/router';
import { user } from '@/user';
import Button from "../ui/Button.vue";
import TextInputField from "../ui/TextInputField.vue";
import { ref } from 'vue';

const errorMessage = ref<string>('');

const twoFactorAuthenticationCode = ref<string>('');

async function secondFactorAuthenticate() {
    const code = twoFactorAuthenticationCode.value;
    const authenticated = await user.secondFactorAuthenticate(code);
    if (!authenticated) {
        errorMessage.value = 'Error while authenticating with 2FA';
        twoFactorAuthenticationCode.value = "";
        return;
    }
	router.replace({ "name": "home"});
}

function moveToLogin() {
    router.push("login");
}

</script>

<template>
	<div class="form-container">
		<div class="form-header">
			<span>2FA</span>
		</div>
		<form @submit.prevent="secondFactorAuthenticate">
            <p>Check your Google Authenticator App and enter the 6 digit code below:</p>
			<TextInputField v-model="twoFactorAuthenticationCode" placeholder-text="ENTER 6 DIGIT CODE"/>
            <div class="error-message">
                {{ errorMessage }}
            </div>
            <div class="form-buttons">
				<Button type="button" @click="moveToLogin">GO BACK TO LOGIN</Button>
                <Button type="submit" :selected="true" @click="">AUTHENTICATE</Button>
			</div>
		</form>
	</div>
</template>

<style scoped>
    .form-container {
		max-width: 700px;
		margin: auto;
		margin-top: 34px;
		border: 4px solid #4BFE65;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #1E9052;
		width: 100%;
		font-size: 34px;
		border-bottom: 4px solid #4BFE65;
		padding: 12px;
		box-sizing: border-box;
	}

    .form-buttons {
		display: flex;
        flex-direction: column;
		margin-top: 24px;
		gap: 24px
	}

    form {
		padding: 32px;
	}

    .error-message {
        color: red;
    }

    /* Everything bigger than 850px */
	@media only screen and (min-width: 850px) {
        .form-buttons {
            flex-direction: row;
        }
	}

</style>
