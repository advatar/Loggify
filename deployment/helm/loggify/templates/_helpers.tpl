{{- define "loggify.name" -}}loggify{{- end }}
{{- define "loggify.labels" -}}
app.kubernetes.io/name: {{ include "loggify.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

