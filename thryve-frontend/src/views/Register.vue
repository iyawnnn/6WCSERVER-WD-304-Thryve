<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../utils/api"; // Axios instance

const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);

const age = ref("");
const weight = ref("");
const weightUnit = ref("kg");
const heightDisplay = ref("");
const heightUnit = ref("cm");

const error = ref("");

const convertFtInToCm = (ftIn) => {
  const match = /^(\d{1,2})'(\d{1,2})$/.exec(ftIn);
  if (!match) return null;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return Math.round((feet * 12 + inches) * 2.54);
};

const convertLbToKg = (lb) => Math.round(lb * 0.453592);

const formatHeightFt = () => {
  if (heightUnit.value !== "ft") {
    return;
  }
  let val = heightDisplay.value.replace(/[^\d']/g, "");
  if (/^\d{1,2}$/.test(val)) val = val.replace(/^(\d{1,2})$/, "$1'");
  if (/^(\d{1,2})'(\d{1,2})$/.test(val)) {
    heightDisplay.value = val;
  } else {
    heightDisplay.value = val;
  }
};

const register = async () => {
  try {
    const weightInKg =
      weightUnit.value === "lb" ? convertLbToKg(weight.value) : weight.value;
    const heightInCm =
      heightUnit.value === "ft" && heightDisplay.value.includes("'")
        ? convertFtInToCm(heightDisplay.value)
        : Number(heightDisplay.value) || null;

    const res = await auth.doRegister({
      name: name.value,
      email: email.value,
      password: password.value,
      age: age.value || null,
      weight: weightInKg || null,
      height: heightInCm || null,
    });

    // ✅ Make sure the token is set in Axios
    api.defaults.headers.common["Authorization"] = `Bearer ${res.token}`;

    // ✅ Optional but recommended: fetch user data
    await auth.fetchMe();

    // 1–2 second delay for UX
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  } catch (err) {
    error.value = err.response?.data?.error || "Registration failed";
  }
};
</script>

<template>
  <div
    class="register-page d-flex justify-content-center align-items-center vh-100"
  >
    <div class="card p-4 shadow-sm w-100">
      <h2 class="title">Create an Account</h2>
      <p>Enter your details below to create your account</p>

      <form @submit.prevent="register">
        <div class="mb-3">
          <label>Name</label>
          <input
            v-model="name"
            type="text"
            class="form-control"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="mb-3">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="johndoe@gmail.com"
            required
          />
        </div>

        <div class="mb-3 position-relative">
          <label>Password</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            placeholder="********"
            required
          />
          <i
            class="toggle-password-icon"
            @click="showPassword = !showPassword"
            :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
          ></i>
        </div>

        <div class="mb-3">
          <label>Age</label>
          <input
            v-model="age"
            type="number"
            min="10"
            max="120"
            class="form-control"
            placeholder="e.g. 25"
          />
        </div>

        <div class="mb-3">
          <label>Weight</label>
          <div class="d-flex">
            <input
              v-model="weight"
              type="number"
              class="form-control me-2"
              placeholder="e.g. 70"
            />
            <select
              v-model="weightUnit"
              class="form-select"
              style="max-width: 100px"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label>Height</label>
          <div class="d-flex">
            <input
              v-model="heightDisplay"
              @input="formatHeightFt"
              type="text"
              class="form-control me-2"
              placeholder="e.g. 5'10"
            />
            <select
              v-model="heightUnit"
              class="form-select"
              style="max-width: 100px"
            >
              <option value="cm">cm</option>
              <option value="ft">ft</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-dark w-100 mt-3">
          Create Account
        </button>
      </form>

      <p class="text-center mt-3">
        Already have an account?
        <router-link to="/login" class="sign-in-link">Login</router-link>
      </p>

      <p v-if="error" class="text-danger text-center mt-2">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.register-page .card {
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem;
  max-width: 400px;
}
.title {
  font-weight: 700;
}
input::placeholder {
  color: #999;
}
.position-relative {
  position: relative;
}
.position-relative input {
  padding-right: 2.5rem;
}
.toggle-password-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  color: #333;
  z-index: 10;
}
.sign-in-link {
  text-decoration: none;
  color: var(--color-dark);
  font-weight: 500;
}
.sign-in-link:hover {
  text-decoration: underline;
  color: var(--color-dark);
}
</style>
