import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SaberTribecaGaugeSetVoteForm,
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
import Select from '@components/inputs/Select'
import { gaugeSetVoteInstruction } from '@tools/sdk/saberTribeca/gaugeSetVoteInstruction'
import Input from '@components/inputs/Input'

const SetGaugeVote = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const { gauges, programs } = useSaberTribecaGauge()

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<SaberTribecaGaugeSetVoteForm>({})
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

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !programs ||
      !form.gaugeName ||
      !gauges ||
      !gauges[form.gaugeName] ||
      form.weight === void 0
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await gaugeSetVoteInstruction({
      weight: form.weight,
      programs,
      gauge: gauges[form.gaugeName].mint,
      payer: wallet.publicKey,
      authority: form.governedAccount.governance.pubkey,
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

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    gauge: yup.string().required('Gauge is required'),
    weight: yup
      .number()
      .min(0, 'Weight should be equals or more than 0')
      .required('Weight is required'),
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

      <Select
        label="Gauge"
        value={form.gaugeName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'gaugeName',
          })
        }
        error={formErrors['gaugeName']}
      >
        {Object.entries(gauges || {}).map(([name, { logoURI }]) => (
          <Select.Option key={name} value={name}>
            <span className="flex flex-row items-center">
              <img className="w-8" src={logoURI} />

              <span className="relative left-2">{name}</span>
            </span>
          </Select.Option>
        ))}
      </Select>

      <Input
        label="Weight (nb of token)"
        value={form.weight}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'weight',
          })
        }
        error={formErrors['weight']}
      />
    </>
  )
}

export default SetGaugeVote
