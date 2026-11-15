import {
  Box, Button, Checkbox, Flex, FormControl, FormHelperText, FormLabel, Grid, HStack, IconButton, Image, Input, NumberInput,
  NumberInputField, Radio, RadioGroup, Select, Text, Textarea, VStack, Wrap, WrapItem,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { bucketUrl } from "@/utils/apiRequest";
import {
  ANSWER_LABELS, SUPPORT_LABELS, SUPPORT_MEDIA, SUPPORT_SECONDS, changeAnswerType, countBlanks, newItemId,
} from "@/utils/quizEditor";
import type { AnswerType, IQuizMedia, IQuizQuestion, QuestionSupport } from "@/interfaces";

interface QuestionFormProps {
  question: IQuizQuestion;
  media: IQuizMedia[];
  onChange: (question: IQuizQuestion) => void;
}

const MAX_OPTIONS = { multiple: 6, single: 4 };

const RemoveButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <IconButton aria-label={label} icon={<CloseIcon boxSize={2.5} />} size="sm" variant="ghost" onClick={onClick} />
);

const MediaPreview = ({ media }: { media: IQuizMedia }) => {
  const src = `${bucketUrl}/${media.path}`;
  if (media.kind === "image") return <Image src={src} alt="" maxH="120px" borderRadius="md" />;
  if (media.kind === "video") return <video src={src} controls style={{ maxHeight: 160, borderRadius: 8 }} />;
  return <audio src={src} controls style={{ width: "100%" }} />;
};

// Editor of one question: what it shows, its answers and how many points it gives
export const QuestionForm = ({ question, media, onChange }: QuestionFormProps) => {
  const set = (changes: Partial<IQuizQuestion>) => onChange({ ...question, ...changes });
  const mediaKind = SUPPORT_MEDIA[question.support];
  const usable = media.filter((m) => m.kind === mediaKind && m.status === "ready");
  const picked = media.find((m) => m._id === question.media_id);

  const answers = () => {
    switch (question.answer_type) {
      case "multiple":
      case "single": {
        const options = question.options ?? [];
        const multi = question.answer_type === "multiple";
        return (
          <FormControl>
            <FormLabel>Propositions <Text as="span" color="text.muted" fontWeight="normal">(coche {multi ? "les bonnes réponses" : "la bonne réponse"})</Text></FormLabel>
            <VStack align="stretch" spacing={2}>
              {options.map((option, index) => (
                <Grid key={option.id} templateColumns="28px 1fr 32px" gap={2} alignItems="center">
                  {multi ? (
                    <Checkbox
                      colorScheme="green"
                      isChecked={question.correct_ids?.includes(option.id)}
                      onChange={(e) => set({
                        correct_ids: e.target.checked
                          ? [...(question.correct_ids ?? []), option.id]
                          : (question.correct_ids ?? []).filter((x) => x !== option.id),
                      })}
                      aria-label="Bonne réponse"
                    />
                  ) : (
                    <Radio colorScheme="green" isChecked={question.correct_id === option.id} onChange={() => set({ correct_id: option.id })} aria-label="Bonne réponse" />
                  )}
                  <Input
                    value={option.text}
                    placeholder={`Proposition ${index + 1}`}
                    onChange={(e) => set({ options: options.map((o) => (o.id === option.id ? { ...o, text: e.target.value } : o)) })}
                  />
                  <RemoveButton
                    label="Retirer"
                    onClick={() => set({
                      options: options.filter((o) => o.id !== option.id),
                      correct_ids: question.correct_ids?.filter((x) => x !== option.id),
                      correct_id: question.correct_id === option.id ? undefined : question.correct_id,
                    })}
                  />
                </Grid>
              ))}
            </VStack>
            {options.length < MAX_OPTIONS[question.answer_type] && (
              <Button size="sm" variant="ghost" leftIcon={<AddIcon boxSize={2.5} />} mt={2} onClick={() => set({ options: [...options, { id: newItemId(), text: "" }] })}>
                Ajouter une proposition
              </Button>
            )}
            {multi && (
              <FormHelperText>
                Chaque bonne case rapporte {question.points}/{question.correct_ids?.length || "?"}, chaque mauvaise case retire {question.points}/
                {Math.max(0, options.length - (question.correct_ids?.length ?? 0)) || "?"} ; tout cocher donne 0.
              </FormHelperText>
            )}
          </FormControl>
        );
      }
      case "true_false":
        return (
          <FormControl>
            <FormLabel>Bonne réponse</FormLabel>
            <RadioGroup value={question.correct_bool === undefined ? "" : String(question.correct_bool)} onChange={(v) => set({ correct_bool: v === "true" })}>
              <HStack spacing={6}><Radio value="true">Vrai</Radio><Radio value="false">Faux</Radio></HStack>
            </RadioGroup>
          </FormControl>
        );
      case "match": {
        const pairs = question.pairs ?? [];
        return (
          <FormControl>
            <FormLabel>Paires à relier <Text as="span" color="text.muted" fontWeight="normal">(la colonne de droite est mélangée pour le joueur)</Text></FormLabel>
            <VStack align="stretch" spacing={2}>
              {pairs.map((pair) => (
                <Grid key={pair.id} templateColumns="1fr 20px 1fr 32px" gap={2} alignItems="center">
                  <Input value={pair.left} placeholder="À gauche" onChange={(e) => set({ pairs: pairs.map((p) => (p.id === pair.id ? { ...p, left: e.target.value } : p)) })} />
                  <Text textAlign="center" color="text.muted">→</Text>
                  <Input value={pair.right} placeholder="À droite" onChange={(e) => set({ pairs: pairs.map((p) => (p.id === pair.id ? { ...p, right: e.target.value } : p)) })} />
                  <RemoveButton label="Retirer" onClick={() => set({ pairs: pairs.filter((p) => p.id !== pair.id) })} />
                </Grid>
              ))}
            </VStack>
            {pairs.length < 8 && (
              <Button size="sm" variant="ghost" leftIcon={<AddIcon boxSize={2.5} />} mt={2} onClick={() => set({ pairs: [...pairs, { id: newItemId(), left: "", right: "" }] })}>
                Ajouter une paire
              </Button>
            )}
          </FormControl>
        );
      }
      case "order": {
        const items = question.items ?? [];
        return (
          <FormControl>
            <FormLabel>Éléments dans le bon ordre <Text as="span" color="text.muted" fontWeight="normal">(ils seront mélangés pour le joueur)</Text></FormLabel>
            <VStack align="stretch" spacing={2}>
              {items.map((item, index) => (
                <Grid key={item.id} templateColumns="24px 1fr 32px" gap={2} alignItems="center">
                  <Text fontWeight="bold" color="text.muted">{index + 1}</Text>
                  <Input value={item.text} onChange={(e) => set({ items: items.map((i) => (i.id === item.id ? { ...i, text: e.target.value } : i)) })} />
                  <RemoveButton label="Retirer" onClick={() => set({ items: items.filter((i) => i.id !== item.id) })} />
                </Grid>
              ))}
            </VStack>
            {items.length < 8 && (
              <Button size="sm" variant="ghost" leftIcon={<AddIcon boxSize={2.5} />} mt={2} onClick={() => set({ items: [...items, { id: newItemId(), text: "" }] })}>
                Ajouter un élément
              </Button>
            )}
          </FormControl>
        );
      }
      case "free_text": {
        const accepted = question.accepted ?? [];
        return (
          <FormControl>
            <FormLabel>Réponses acceptées</FormLabel>
            <VStack align="stretch" spacing={2}>
              {accepted.map((value, index) => (
                <Grid key={index} templateColumns="1fr 32px" gap={2}>
                  <Input value={value} placeholder="Ex. Ichigo Kurosaki" onChange={(e) => set({ accepted: accepted.map((a, i) => (i === index ? e.target.value : a)) })} />
                  <RemoveButton label="Retirer" onClick={() => set({ accepted: accepted.filter((_, i) => i !== index) })} />
                </Grid>
              ))}
            </VStack>
            <Button size="sm" variant="ghost" leftIcon={<AddIcon boxSize={2.5} />} mt={2} onClick={() => set({ accepted: [...accepted, ""] })}>Ajouter une variante</Button>
            <FormHelperText>
              Majuscules, accents, ponctuation et petites fautes sont tolérés. Une réponse proche mais douteuse part dans « À vérifier » chez les participants.
            </FormHelperText>
          </FormControl>
        );
      }
      case "blanks": {
        const blanks = question.blanks ?? [];
        const count = countBlanks(question.blank_text ?? "");
        const resize = (text: string) => {
          const n = countBlanks(text);
          set({ blank_text: text, blanks: Array.from({ length: n }, (_, i) => blanks[i] ?? { accepted: [""] }) });
        };
        return (
          <VStack align="stretch" spacing={3}>
            <FormControl>
              <FormLabel>Texte avec les trous</FormLabel>
              <Textarea value={question.blank_text ?? ""} placeholder="Ban… [1] ! [2] Getsuga Tenshō !" onChange={(e) => resize(e.target.value)} rows={2} />
              <FormHelperText>Marque chaque trou avec [1], [2]… dans l'ordre. {count} trou{count > 1 ? "s" : ""} trouvé{count > 1 ? "s" : ""}.</FormHelperText>
            </FormControl>
            {blanks.map((blank, index) => (
              <FormControl key={index}>
                <FormLabel fontSize="sm">Trou [{index + 1}] : réponses acceptées, séparées par « ; »</FormLabel>
                <Input
                  value={blank.accepted.join(" ; ")}
                  onChange={(e) => set({ blanks: blanks.map((b, i) => (i === index ? { accepted: e.target.value.split(";").map((v) => v.trim()) } : b)) })}
                />
              </FormControl>
            ))}
          </VStack>
        );
      }
      default:
        return null;
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        <FormControl>
          <FormLabel>Support de la question</FormLabel>
          <Wrap spacing={2}>
            {(Object.keys(SUPPORT_LABELS) as QuestionSupport[]).map((support) => (
              <WrapItem key={support}>
                <Button
                  size="sm"
                  variant={question.support === support ? "solid" : "outline"}
                  colorScheme={question.support === support ? "purple" : "gray"}
                  onClick={() => set({ support, media_id: support === question.support ? question.media_id : null })}
                >
                  {SUPPORT_LABELS[support]} · {SUPPORT_SECONDS[support]} s
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="question-type">Type de réponse</FormLabel>
          <Select id="question-type" value={question.answer_type} onChange={(e) => onChange(changeAnswerType(question, e.target.value as AnswerType))}>
            {(Object.keys(ANSWER_LABELS) as AnswerType[]).map((type) => <option key={type} value={type}>{ANSWER_LABELS[type]}</option>)}
          </Select>
        </FormControl>
      </Grid>

      <FormControl>
        <FormLabel htmlFor="question-prompt">Question</FormLabel>
        <Textarea id="question-prompt" rows={2} value={question.prompt} onChange={(e) => set({ prompt: e.target.value })} />
      </FormControl>

      {mediaKind && (
        <FormControl>
          <FormLabel htmlFor="question-media">Média</FormLabel>
          <Select id="question-media" placeholder={usable.length ? "Choisir dans la médiathèque" : "Aucun média de ce type : ajoute-le dans la médiathèque"} value={question.media_id ?? ""} onChange={(e) => set({ media_id: e.target.value || null })}>
            {usable.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </Select>
          {picked && <Box mt={2}><MediaPreview media={picked} /></Box>}
        </FormControl>
      )}

      {answers()}

      <Flex gap={4} align="flex-end" wrap="wrap">
        <FormControl w="160px">
          <FormLabel htmlFor="question-points">Points</FormLabel>
          <NumberInput id="question-points" min={0.5} max={100} step={0.5} value={question.points} onChange={(_, value) => set({ points: Number.isFinite(value) ? value : 0 })}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <Text fontSize="sm" color="text.muted" pb={2}>Durée : {SUPPORT_SECONDS[question.support]} s (selon le support)</Text>
      </Flex>
    </VStack>
  );
};
