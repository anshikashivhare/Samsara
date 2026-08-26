from attribution.vessel_ranking import rank_vessels

class AttributionService:
    def rank(self, evidence_dataframe):
        return rank_vessels(evidence_dataframe)
