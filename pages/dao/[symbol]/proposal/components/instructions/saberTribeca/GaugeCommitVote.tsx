import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SaberTribecaGaugeCommitVoteForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useSaberTribecaGauge from '@hooks/useSaberTribecaGauge'
import { gaugeCommitVoteInstruction } from '@tools/sdk/saberTribeca/gaugeCommitVoteInstruction'
import GaugeSelect from './GaugeSelect'

const GaugeCommitVote = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()
  const { gauges, programs } = useSaberTribecaGauge()

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<SaberTribecaGaugeCommitVoteForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !programs ||
      !form.gaugeName ||
      !gauges ||
      !gauges[form.gaugeName]
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await gaugeCommitVoteInstruction({
      programs,
      gauge: gauges[form.gaugeName].mint,
      payer: wallet.publicKey,
      authority: pubkey,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    gaugeName: yup.string().required('Gauge is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <GaugeSelect
        gauges={gauges}
        value={form.gaugeName}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'gaugeName',
          })
        }
        error={formErrors['gaugeName']}
      />
    </>
  )
}

export default GaugeCommitVote
