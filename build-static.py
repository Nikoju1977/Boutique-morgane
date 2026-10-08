# Le site utilise désormais un Worker pour sa gestion persistante.
import subprocess
subprocess.run(['npm','run','build'],check=True)
