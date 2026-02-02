import { login } from './auth.js'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm')
  const msg = document.getElementById('loginMessage')

  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    msg.textContent = ''

    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value.trim()
    const role = document.getElementById('role').value

    try {
      await login(email, password, role)
      window.location.href = 'admin/dashboard.html'
    } catch (err) {
      msg.textContent = err.message
      msg.className = 'message error'
    }
  })
})
