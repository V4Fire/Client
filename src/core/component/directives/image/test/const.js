/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

module.exports = {
	pngImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAB3UlEQVR4nO2YvYviQBxAn1ExGhMUAjFpbWy0shH/f2y0sbAKwSYQxC9EMxqNueIwV1yxWTfLDsu8LvDjzbzJVFOZz+cZvwDtpzdQFipENlSIbKgQ2VAhsqFCZEOFyIYKkQ0VIhsqRDZqRQf3+z2r1Sr/HgwGmKbJcrnkdrvRbrcZjUZo2sdnU6brReHJJElotVpMp1Mmkwm2bRNFEVmWMR6POZ/P7Ha7fN73fRaLBUIIZrMZl8vlbVepIbfbjTiOmc1m+L4PwOVyQdd1dF2nXq8jhMjnPc9DCEEQBFiWhWEYb7uKUPhq9Xo9HMdhu92yXq9xHIc0TanV/ioqlQpZ9u9lqdVq0e12ORwODIfDL7mKUPiPNBoNdF2n1+sBcL1eqVarpGkKwP1+zzfy4vF4APx3uu+4Sgt5kSQJAPV6HcMwiOOYzWZDlmWYppnPnU4n4jim0+kQhuGXXKWGCCG43++EYYimaViWhed5NJtNgiDAdV0sy8rnwzDEtm1c10UIwfF4fNtVhErRJ1Pf94miCIB+v4/rup9a6LtcLwqHPJ9P4jhG1/VP39/vdL0obNE0jXa7XcqiZbpyZ6m2H0SFyIYKkQ0VIhsqRDZUiGyoENlQIbKhQmRDhcjGrwn5Aw21BwbJxeTIAAAAAElFTkSuQmCC',
	pngImage2x: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAESUlEQVR4nO3cSU/qYBiG4acDIAqiDA4YlsYhxrjw//8C3eBCF5KYEAWZkVIp0PYsCLVlLJ5jzmPyXqtKPvS1dyc1Ubm7u3MhaKj/ewARJEHISBAyEoSMBCEjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCEjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCEjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCGjb/oG13XRbrfR6XRgmiZM00Q0GsXNzc3cWsMw8PLygl6vB13XkUgkkM/nkUqlvrXub/2G2TcOUiwW0ev1Aq9FIpG5df1+H8ViEY7jAABs24ZlWWi1Wri6uvIGDrvuX/gNs28cJBqNTt6o6xiPxwAARVHm1pXLZW/QVCqFWCyGWq0G13VRLpe9YcOu86vVaiiVSnAcB5lMBufn5wCAh4cHGIYBVVVxe3sLTdPoZl9n4yCnp6c4OzuDZVm4v79f+E05joN2uz35ArqOy8tLaJoG0zRhGAY6nQ4sy0IkEgm1LhaLBT5/JpNBqVSC67poNpsYjUawLAvdbhcAcHx8PBeDZfZ1Nr6p67oOVVW9IwMAVDX4aT4+PmDbNgAgHo97Oycej3trTNMMvW6Wpmk4PDwEMLkvtFotNBoNAJMdnM/naWdf59tPWa779V+dZo+y0Wjkbfuv0dNLBgAMh8PQ6xbx7/RGo+EFOTg4CLyfcfZV/kmQ2aPMP6yuf10V/YOPRqPQ6xbZ2tpCOp0GALTbbQwGAwDAyckJ/eyrfDuI/7SfPcqmN0wgOOzsjgi7bpnZnZ9Op7G9vf0rZl/mR84Q/8f+b96/Pb2eh1m3TCKRCOzQRY+wrLMv8yNniH8Q/5Hk39Y0LfS6Zd7f3wM7t16vh7pMMMy+zI+cIcuG/fz89LZjsVjodcu8vb0B+NqpjuOgWq3+itmX+ZGnrN3dXW97erO1bRuGYQCA9yuGsOsWabVa3nsKhYL3eqVSCczGOPsqG13kLMtCvV7HeDz2vjAAdLtdPD8/w7ZtZDIZZLNZ7OzsoN/vYzAY4PHxEbZte0fS/v4+gMkjYph1i0zPjmg0ikKhgGq1iuFwiOFwiEajgVwuRzv7KhsFqVarKJfLc69Pf1EHAMlkEsDkqH16egIANJtNb62qqoEjOuw6v36/j06nA2DyZKUoCnK5HF5fXwFMYs0GYZl9nY0uWWFuUtMfjLLZLC4uLpBMJr2b4N7eHq6vrwOPpmHX+VUqFaiqikgk4v3EfnR0BEVRoKoqTNP0LiNss6+jyD9S5iJ/oCIjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCEjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCEjQchIEDIShIwEISNByEgQMhKEjAQhI0HISBAyEoSMBCEjQchIEDIShIwEISNByPwBpaZErSDxgLcAAAAASUVORK5CYII=',

	preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAdUlEQVR4nO2TMQoDIRBF3w9hQDyD3v8wXkEPYGGxnYJsurAk2VRbJT6YZh48mGKUUtq5kNuVsRX8l+D9dVFrpbWGcw5JxBjJOWNmhBA++q9B7z29d8YYSALAzDCzU3/k7eRSCpKeAzDnZNu2U39E6/VW8BeDDxbiLSKs7IltAAAAAElFTkSuQmCC',
	broken: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAA10lEQVR4nO3VsYqEMBSF4X9WZbQQJAhioYX6/k9ibSdYCCJqKjEgxEy3nSMWyzBsTptDPm7gkkdd14YP5OcTqIUtbGELfyfsnh10XYeUkrIsWdeVcRwpioIoimiahjAMCYKAOI7fds9yOnGe5/i+j+u6zPNMVVUsywJAkiQMw4AQ4rJ7G1ZKobVGKYUxBmMMjuMAoLVGa81xHJfd2/Dz+UQIwbZtCCFo2/b36aSUpGnKNE2X3bM8zv7jvu/Z950sy/A87+0ld7qX8F/n/+2xhS1sYQt/H/wCIhh6GW52F0QAAAAASUVORK5CYII='
};
