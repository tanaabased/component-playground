<script setup>
const schema = {
  name: 'article',
  props: {
    hidden: { kind: 'boolean', default: false },
  },
  slots: {
    default: { kind: 'text', default: 'Built from the packed public VitePress exports.' },
  },
};
</script>

# VitePress consumer

<ComponentPlayground component="article" :schema="schema" />
