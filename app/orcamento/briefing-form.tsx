"use client";

import {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  CheckIcon as Check,
  CopyIcon as Copy,
  PencilSimpleIcon as PencilSimple,
  WarningCircleIcon as WarningCircle,
  WhatsappLogoIcon as WhatsappLogo,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePersonality } from "@/components/personality";
import { briefingWhatsapp, site } from "@/lib/site";
import styles from "./briefing.module.css";
import {
  type Answers,
  type ChoiceField,
  type Field,
  type TextField,
  buildSummary,
  fieldError,
  steps,
  visibleFields,
  visibleSteps,
} from "./steps";

/* ─────────────────────────── rascunho no navegador ───────────────────────────
   localStorage pode lancar (modo anonimo, cookies bloqueados) ou devolver lixo
   de uma versao antiga. Nos dois casos o formulario comeca vazio e segue. */

const DRAFT_KEY = "gsys:orcamento";
const REVIEW = "revisao";

type Draft = { answers: Answers; at: string };

function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Draft>;
    if (!data || typeof data.answers !== "object" || data.answers === null) return null;
    const answers: Answers = {};
    for (const [key, value] of Object.entries(data.answers)) {
      if (typeof value === "string") answers[key] = value;
      else if (Array.isArray(value)) answers[key] = value.filter((item) => typeof item === "string");
    }
    return { answers, at: typeof data.at === "string" ? data.at : steps[0].id };
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft) {
  try {
    if (Object.keys(draft.answers).length === 0) window.localStorage.removeItem(DRAFT_KEY);
    else window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* o rascunho nao persiste; o formulario continua funcionando */
  }
}

const hasAnswers = (answers: Answers) =>
  Object.values(answers).some((value) => (Array.isArray(value) ? value.length > 0 : value.trim() !== ""));

/* O rascunho so existe no navegador. O HTML estatico sai sem o formulario e o
   navegador o monta ja com o rascunho, sem divergencia na hidratacao. */
const noSubscribe = () => () => {};

export function BriefingForm() {
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  return mounted ? <Briefing /> : null;
}

const domId = (field: Field) => (field.kind === "choice" ? `briefing-${field.id}-0` : `briefing-${field.id}`);

function Briefing() {
  const [initial] = useState(loadDraft);
  const [answers, setAnswers] = useState<Answers>(initial?.answers ?? {});
  const [at, setAt] = useState(initial?.at ?? steps[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(() => Boolean(initial && hasAnswers(initial.answers)));
  const [copyState, setCopyState] = useState<"idle" | "copied" | "selected">("idle");
  const { sound } = usePersonality();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLPreElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const firstRender = useRef(true);

  const visible = useMemo(() => visibleSteps(answers), [answers]);
  const reviewing = at === REVIEW;
  // Um rascunho que aponta para uma etapa que nao existe mais volta ao inicio.
  const index = reviewing ? visible.length : Math.max(0, visible.findIndex((step) => step.id === at));
  const step = reviewing ? null : visible[index];
  const fields = step ? visibleFields(step, answers) : [];
  const isLast = index === visible.length - 1;

  const summary = useMemo(() => (reviewing ? buildSummary(answers, new Date()) : ""), [answers, reviewing]);

  useEffect(() => { saveDraft({ answers, at }); }, [answers, at]);

  /* Trocar de etapa leva o foco ao titulo dela: o leitor de tela anuncia onde
     a pessoa esta e o teclado recomeca do topo. Na primeira carga, nao. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [at]);

  /* Depois que o erro aparece na tela, o foco vai ao primeiro campo invalido,
     para o erro ser lido junto com o campo. */
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [errors]);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    if (errors[id]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  const goTo = (target: string) => {
    setErrors({});
    setCopyState("idle");
    setRestored(false);
    setAt(target);
  };

  const next = () => {
    if (!step) return;
    const found = fields
      .map((field) => [field, fieldError(field, answers[field.id])] as const)
      .filter((entry): entry is readonly [Field, string] => entry[1] !== null);
    if (found.length) {
      pendingFocus.current = domId(found[0][0]);
      setErrors(Object.fromEntries(found.map(([field, message]) => [field.id, message])));
      sound.play("error");
      return;
    }
    goTo(isLast ? REVIEW : visible[index + 1].id);
  };

  const back = () => {
    if (index > 0) goTo(visible[index - 1].id);
  };

  const restart = () => {
    if (!window.confirm("Apagar todas as respostas e começar do zero?")) return;
    setAnswers({});
    setRestored(false);
    goTo(steps[0].id);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyState("copied");
      sound.play("ok");
    } catch {
      // Sem permissao de area de transferencia: seleciona o texto para a
      // pessoa copiar pelo menu do aparelho. Selecao nao altera o DOM.
      const node = summaryRef.current;
      if (node) {
        node.focus();
        window.getSelection()?.selectAllChildren(node);
      }
      setCopyState("selected");
    }
  };

  const whatsappHref = `https://wa.me/${briefingWhatsapp}?text=${encodeURIComponent(summary)}`;
  const progress = reviewing ? 100 : Math.round((index / visible.length) * 100);

  return (
    <div className={styles.shell}>
      {restored && (
        <div className={styles.restored}>
          <p>Suas respostas anteriores foram recuperadas deste navegador.</p>
          <button className={styles.textButton} type="button" onClick={restart}>
            Começar do zero
          </button>
        </div>
      )}

      <div className={styles.progress}>
        <p className={styles.progressLabel}>
          {reviewing ? (
            <>Revisão <span>· tudo respondido</span></>
          ) : (
            <>Etapa <b>{index + 1}</b> de {visible.length}</>
          )}
        </p>
        <div className={styles.bar} aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step ? (
        <form
          className={styles.form}
          noValidate
          aria-labelledby="briefing-step-title"
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <h2 className={styles.stepTitle} id="briefing-step-title" ref={headingRef} tabIndex={-1}>
            {step.title}
          </h2>
          {step.hint && <p className={styles.note}>{step.hint}</p>}
          {index === 0 && (
            <p className={styles.note}>
              Só os campos com <span aria-hidden="true">*</span><span className={styles.srOnly}>asterisco</span> são
              obrigatórios. As respostas ficam salvas neste navegador enquanto você preenche.
            </p>
          )}

          <div className={styles.fields}>
            {fields.map((field) =>
              field.kind === "choice" ? (
                <ChoiceInput
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  error={errors[field.id]}
                  onChange={(value) => setAnswer(field.id, value)}
                />
              ) : (
                <TextInput
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  error={errors[field.id]}
                  onChange={(value) => setAnswer(field.id, value)}
                />
              ),
            )}
          </div>

          <div className={styles.nav}>
            {index > 0 && (
              <button className="button-ghost" type="button" onClick={back}>
                <ArrowLeft size={18} aria-hidden="true" /> Voltar
              </button>
            )}
            <button className={`button-solid ${styles.next}`} type="submit">
              {isLast ? "Revisar e enviar" : "Continuar"} <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : (
        <section className={styles.review} aria-labelledby="briefing-step-title">
          <h2 className={styles.stepTitle} id="briefing-step-title" ref={headingRef} tabIndex={-1}>
            Confira e envie.
          </h2>
          <p className={styles.note}>
            É este texto que chega para mim. Arquivos, prints e outros materiais você manda depois, na
            mesma conversa do WhatsApp.
          </p>

          <pre className={styles.summary} ref={summaryRef} tabIndex={0} aria-label="Resumo das respostas">
            {summary}
          </pre>

          <div className={styles.actions}>
            <a className="button-solid" href={whatsappHref} target="_blank" rel="noreferrer">
              <WhatsappLogo size={20} aria-hidden="true" /> Enviar respostas pelo WhatsApp
            </a>
            <button className="button-ghost" type="button" onClick={copy}>
              {copyState === "copied" ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
              {copyState === "copied" ? "Respostas copiadas" : "Copiar respostas"}
            </button>
            <button className="button-ghost" type="button" onClick={() => goTo(visible[0].id)}>
              <PencilSimple size={18} aria-hidden="true" /> Revisar respostas
            </button>
          </div>

          <p className={styles.copyStatus} role="status">
            {copyState === "copied" && "Respostas copiadas. É só colar na conversa ou no e-mail."}
            {copyState === "selected" &&
              "Não deu para copiar direto. O texto está selecionado: use Copiar no menu do aparelho, ou Ctrl+C."}
          </p>

          <p className={styles.email}>
            Prefere e-mail? Copie as respostas e mande para{" "}
            <span className={styles.emailAddress}>{site.email}</span>
          </p>
        </section>
      )}
    </div>
  );
}

function Required({ describe }: { describe: boolean }) {
  return (
    <>
      <span className={styles.required} aria-hidden="true">*</span>
      {describe && <span className={styles.srOnly}> (obrigatório)</span>}
    </>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className={styles.error} id={id}>
      <WarningCircle size={18} weight="bold" aria-hidden="true" /> {message}
    </p>
  );
}

const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

function TextInput({
  field,
  value,
  error,
  onChange,
}: {
  field: TextField;
  value: Answers[string] | undefined;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = domId(field);
  const hintId = field.hint && `${id}-hint`;
  const errorId = `${id}-error`;
  const common = {
    id,
    className: styles.input,
    value: typeof value === "string" ? value : "",
    "aria-required": field.required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(hintId, error && errorId),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {field.label}
        {field.required && <Required describe={false} />}
      </label>
      {field.hint && <p className={styles.hint} id={hintId}>{field.hint}</p>}
      {field.multiline ? (
        <textarea {...common} rows={3} placeholder={field.placeholder} />
      ) : (
        <input
          {...common}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete ?? "off"}
          placeholder={field.placeholder}
        />
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function ChoiceInput({
  field,
  value,
  error,
  onChange,
}: {
  field: ChoiceField;
  value: Answers[string] | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
}) {
  const picked = Array.isArray(value) ? value : value ? [value] : [];
  const hintId = `briefing-${field.id}-hint`;
  const errorId = `briefing-${field.id}-error`;
  const hint = field.max ? `${field.hint} ${picked.length} de ${field.max} escolhidas.` : field.hint;

  const toggle = (option: string, checked: boolean) => {
    if (!field.multiple) {
      onChange(option);
      return;
    }
    // Mantem a ordem das opcoes, nao a ordem dos cliques.
    const set = new Set(picked);
    if (checked) set.add(option);
    else set.delete(option);
    onChange(field.options.filter((item) => set.has(item)));
  };

  return (
    <fieldset className={styles.field} aria-describedby={describedBy(hint && hintId, error && errorId)}>
      <legend className={styles.label}>
        {field.label}
        {field.required && <Required describe />}
      </legend>
      {hint && <p className={styles.hint} id={hintId}>{hint}</p>}
      <div className={styles.options}>
        {field.options.map((option, optionIndex) => (
          <label className={styles.option} key={option}>
            <input
              id={`briefing-${field.id}-${optionIndex}`}
              type={field.multiple ? "checkbox" : "radio"}
              name={`briefing-${field.id}`}
              value={option}
              checked={picked.includes(option)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => toggle(option, event.target.checked)}
            />
            {field.details?.[option] ? (
              <span className={styles.optionText}>
                <span>{option}</span>
                <small>{field.details[option]}</small>
              </span>
            ) : (
              <span>{option}</span>
            )}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
